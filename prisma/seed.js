import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const main = async () => {
    return;
    console.log('SEEDING FIRST');
    const yama = await db.kanji.create({
        data: {
            kanji: '山',
            mean: 'gunung',
            level: 'N5',
            day: 1,
            kunyomi: ['yama'],
            onyomi: ['san'],
            kanjiWords: {
                createMany: {
                    data: [
                        {
                            word: '山',
                            kana: 'やま',
                            mean: 'gunung',
                        },
                        {
                            word: '富士山',
                            kana: 'ふじさん',
                            mean: 'gunung fuji',
                        },
                        {
                            word: '登山',
                            kana: 'とうざん',
                            mean: 'mendaki gunung',
                        }
                    ]
                }
            }
        }
    })

    const kawa = await db.kanji.create({
        data: {
            kanji: '川',
            mean: 'sungai',
            level: 'N5',
            day: 1,
            kunyomi: ['kawa'],
            onyomi: ['sen'],
            kanjiWords: {
                createMany: {
                    data: [
                        {
                            word: '川',
                            kana: 'かわ',
                            mean: 'sungai',
                        },
                        {
                            word: '山川さん',
                            kana: 'やまかわん',
                            mean: 'yamakawa san',
                        },
                        {
                            word: 'カプアス川',
                            kana: 'カプアスがわ',
                            mean: 'sungai kapuas',
                        }
                    ]
                }
            }
        }
    })

    const ta = await db.kanji.create({
        data: {
            kanji: '田',
            mean: 'sawah',
            level: 'N5',
            day: 1,
            kunyomi: ['ta'],
            onyomi: ['den'],
            kanjiWords: {
                createMany: {
                    data: [
                        {
                            word: '田',
                            kana: 'た',
                            mean: 'sawah',
                        },
                        {
                            word: '山田さん',
                            kana: 'やまださん',
                            mean: 'yamada san',
                        },
                        {
                            word: '水田',
                            kana: 'すいでん',
                            mean: 'sawah (formal)',
                        },
                        {
                            word: '油田',
                            kana: 'ゆうてん',
                            mean: 'ladang minyak',
                        },
                    ]
                }
            }
        }
    })

    const hi = await db.kanji.create({
        data: {
            kanji: '日',
            mean: 'hari',
            level: 'N5',
            day: 1,
            kunyomi: ['hi', 'bi'],
            onyomi: ['nichi', 'ni', 'youbi'],
            kanjiWords: {
                createMany: {
                    data: [
                        {
                            word: '日',
                            kana: 'ひ',
                            mean: 'hari',
                        },
                        {
                            word: '日本',
                            kana: 'にほん',
                            mean: 'jepang',
                        },
                        {
                            word: '日曜日',
                            kana: 'にちようび',
                            mean: 'hari minggu',
                        },
                        {
                            word: '休日',
                            kana: 'きゅうじつ',
                            mean: 'hari libur',
                        },
                    ]
                }
            }
        }
    })

    const tsuki = await db.kanji.create({
        data: {
            kanji: '月',
            mean: 'bulan',
            level: 'N5',
            day: 1,
            kunyomi: ['tsuki'],
            onyomi: ['getsu', 'gatsu'],
            kanjiWords: {
                createMany: {
                    data: [
                        {
                            word: '月',
                            kana: 'つき',
                            mean: 'bulan/moon',
                        },
                        {
                            word: '月曜日',
                            kana: 'げつようび',
                            mean: 'hari senin',
                        },
                        {
                            word: '一月',
                            kana: 'いちがつ',
                            mean: 'bulan pertama/januari',
                        },
                        {
                            word: '今月',
                            kana: 'こんげつ',
                            mean: 'bulan ini',
                        },
                    ]
                }
            }
        }
    })
    console.log('SEED DONE', { yama, kawa, ta, hi, tsuki });
}

main()
    .then(async () => {
        await db.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await db.$disconnect()
        process.exit(1)
    })