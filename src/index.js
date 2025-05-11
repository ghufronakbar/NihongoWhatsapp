import dotenv from "dotenv";
dotenv.config();

import Whatsapp from "whatsapp-web.js"
const { Client, LocalAuth } = Whatsapp
import qrcode from "qrcode-terminal";
import { CLIENT_ID, DISABLE_SANDBOX, TARGET_NUMBER } from "./constant/index.js";
import { db } from "./lib/db.js";
import cron from 'node-cron';

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: CLIENT_ID,
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

console.log('GET READY FOR 日本語勉強します')
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
})
client.on('authenticated', async () => console.log('AUTHENTICATED ちょっとまって')
)

client.on('ready', () => {
    console.log('READY 行くぞ!')

    cron.schedule('* * * * *', async () => {
        try {
            const chat = await client.getChatById(TARGET_NUMBER);
            const lastMessage = await chat.fetchMessages({ fromMe: true, limit: 1 });
            // jika belum dijawab maka tidak akan mengirimkan pertanyaan
            if (lastMessage?.[0]?.body?.includes?.(HEADER_QUESTION)) return
            console.log('SENDING QUESTION...');
            await sendQuestion(TARGET_NUMBER)
            console.log('QUESTION SENT');
        } catch (error) {
            console.error('ERROR WHILE SENDING QUESTION:', error.message);
        }
    });
})


client.on('message', async (e) => {
    try {
        const { body } = e
        if (!body.startsWith('!')) return

        if (body.startsWith('!help')) {

            client.sendMessage(e.from, HELP_MESSAGE);
        }
        if (body.startsWith('!all')) {
            const allowedLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];
            const level = allowedLevels.find(level => body.includes(level));
            const kanjisByLevel = await getAllKanjis(level);
            const msgByLevel = await getAllKanjisMessage(kanjisByLevel);
            client.sendMessage(e.from, msgByLevel);
        }

        if (body.startsWith('!answer:')) {
            const chat = await client.getChatById(e.from);
            const lastMessage = await chat.fetchMessages({ fromMe: true, limit: 1 });
            if (lastMessage[0].body.includes('[QUESTION]:')) {
                const question = lastMessage[0].body.split('[QUESTION]:')[1];
                const answer = body.split('!answer:')[1];
                const kanji = await getKanjiWordByKanji(question);
                const isCorrect = kanji?.kana === answer;
                if (isCorrect) {
                    await updateScoreKanjiWord(kanji.id, kanji.score + 1);
                } else {
                    await updateScoreKanjiWord(kanji.id, kanji.score - 1);
                }
                const msg = await getKanjiAnswerMessage(answer, isCorrect, kanji);
                client.sendMessage(e.from, msg);
            } else {
                client.sendMessage(e.from, 'No question found');
            }
        }

        if (body.startsWith('!test')) {
            await sendQuestion(e.from, body);
        }

    } catch (error) {
        console.log(error)
    }
})

/**
 * PARAMETER
 * 'N5' | 'N4' | 'N3' | 'N2' | 'N1' (Optional) 
 */
const getAllKanjis = async (level) => {
    try {
        const kanjis = await db.kanji.findMany({
            include: {
                kanjiWords: true
            },
            where: level ? {
                level,
            } : undefined,
            orderBy: [
                { level: 'desc' }, // N5 → N1 descending
                { day: 'asc' }
            ]
        });

        const groupedByLevel = new Map()

        for (const kanji of kanjis) {
            const { level, day, kanji: kanjiChar, mean, onyomi, kunyomi, kanjiWords } = kanji;

            if (!groupedByLevel.has(level)) {
                groupedByLevel.set(level, new Map());
            }

            const dayGroup = groupedByLevel.get(level);
            if (!dayGroup.has(day)) {
                dayGroup.set(day, []);
            }

            dayGroup.get(day).push({
                kanji: kanjiChar,
                mean,
                onyomi,
                kunyomi,
                words: kanjiWords.map(word => ({
                    word: word.word,
                    kana: word.kana,
                    mean: word.mean,
                })),
            });
        }

        // Format to Output interface
        const mapped = Array.from(groupedByLevel.entries()).map(([level, dayMap]) => ({
            level,
            days: Array.from(dayMap.entries()).map(([day, kanjis]) => ({
                day,
                kanjis
            }))
        }));

        return mapped;
    } catch (error) {
        console.log(error);
    }
};


const getAllKanjisMessage = async (items) => {
    let message = '**KANJI LIST**\n\n';
    if (items.length === 0) return message += 'No data found';
    for await (const item of items) {
        message += `*${item.level}*\n\n`;
        for await (const day of item.days) {
            message += `*Day ${day.day}*\n\n`;
            for await (const kanji of day.kanjis) {
                message += `*${kanji.kanji} - ${kanji.mean}*\n`;
                message += `Kunyomi: ${kanji.kunyomi.join(', ')}\n`;
                message += `Onyomi: ${kanji.onyomi.join(', ')}\n`;
                message += `Words Example: \n`;
                let i = 1;
                for await (const word of kanji.words) {
                    message += `${i++}. ${word.word} : ${word.kana} (${word.mean})\n`;
                }
                message += `\n\n`;
            }
        }
    }

    return message
}


/**
 * PARAMETER
 * 'N5' | 'N4' | 'N3' | 'N2' | 'N1' (Optional) 
 */
const getKanjiWord = async (level) => {
    const word = await db.kanjiWord.findFirst({
        where: level ? {
            kanji: {
                level,
            }
        } : undefined,
        orderBy: {
            score: 'asc'
        },
        include: {
            kanji: true
        }
    })

    return word;
}

const HEADER_QUESTION = `*Answer the kanji with the correct kana*`

/**
 * Params kanji:KanjiWord extends Kanji
 */
const getKanjiMessage = async (item) => {
    if (!item) return `No data found`
    return `${HEADER_QUESTION} ${item.kanji.level} - Day ${item.kanji.day}\n\n[QUESTION]:${item?.word}`
}

/**
 * Params 
 * answer:string (furigana)
 * correct:boolean
 * kanji: KanjiWord extends Kanji | null
 */
const getKanjiAnswerMessage = async (answer, boolean, kanjiWord) => {
    if (!kanjiWord) return `No data found`
    return `${boolean ? '*Correct*' : '*Wrong*'}
[QUESTION]:${kanjiWord?.word}
[ANSWER]:${answer}
    
Explanation:
${kanjiWord?.word} : ${kanjiWord?.kana} (${kanjiWord?.mean})

Base Kanji:
${kanjiWord?.kanji?.kanji} : ${kanjiWord?.mean}
Kunyomi: ${kanjiWord?.kanji?.kunyomi.join(', ')}
Onyomi: ${kanjiWord?.kanji?.onyomi.join(', ')}
    `
}

const getKanjiWordByKanji = async (kanji) => {
    const kanjiWord = await db.kanjiWord.findFirst({
        where: {
            word: kanji
        },
        include: {
            kanji: true
        }
    })
    return kanjiWord;
}

const updateScoreKanjiWord = async (id, score) => {
    const data = await db.kanjiWord.update({
        where: {
            id: id
        },
        data: {
            score
        }
    })
}

const HELP_MESSAGE = `*How to use*

!help - for help
!all - for all kanjis
!all:N5 - for N5 kanjis (works for N5, N4, N3, N2, N1)
!test:N5 - for test (works for N5, N4, N3, N2, N1)
!answer:<answer> - for answer
`

const sendQuestion = async (to, body) => {
    const allowedLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const level = allowedLevels.find(level => body?.includes(level));
    const kanji = await getKanjiWord(level);
    const msg = await getKanjiMessage(kanji);
    client.sendMessage(to, msg);
}

client.initialize();
