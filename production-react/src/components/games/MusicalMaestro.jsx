import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MusicalNoteIcon,
  MicrophoneIcon,
  PlayIcon,
  StopIcon,
  ArrowLeftIcon,
  ClockIcon,
  SparklesIcon,
  TrophyIcon,
  StarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { generateWithRateLimit } from '../../services/claudeService'
import { useAutoSave, loadSavedState, saveToGallery, AutoSaveIndicator } from '../../hooks/useAutoSave.jsx'
import AgeButton from '../AgeButton'
import ShareButton from '../ShareButton'

/**
 * Musical Maestro - Sing Your Heart Out!
 *
 * Kids can choose from Disney, K-pop, or custom songs and record themselves singing.
 * AI generates fun, encouraging performance reviews with star ratings.
 */
export default function MusicalMaestro() {
  const savedState = loadSavedState('musical-maestro-game', {})

  const [singerName, setSingerName] = useState(savedState.singerName || '')
  const [songCategory, setSongCategory] = useState(savedState.songCategory || 'disney')
  const [selectedSong, setSelectedSong] = useState(savedState.selectedSong || '')
  const [customSongTitle, setCustomSongTitle] = useState(savedState.customSongTitle || '')
  const [customArtist, setCustomArtist] = useState(savedState.customArtist || '')
  const [customLyrics, setCustomLyrics] = useState(savedState.customLyrics || '')

  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState(null)
  const [recordingUrl, setRecordingUrl] = useState(null)

  const [reviewGenerated, setReviewGenerated] = useState(false)
  const [generatedReview, setGeneratedReview] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingStartTimeRef = useRef(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const timerIntervalRef = useRef(null)
  const lyricsRef = useRef(null)
  const [currentLine, setCurrentLine] = useState(0)

  // Auto-save game state
  const gameState = { singerName, songCategory, selectedSong, customSongTitle, customArtist, customLyrics }
  useAutoSave('musical-maestro-game', gameState, 1000)

  const songLibrary = {
    disney: [
      {
        id: 'let-it-go',
        title: 'Let It Go',
        movie: 'Frozen',
        lyrics: `The snow glows white on the mountain tonight\nNot a footprint to be seen\nA kingdom of isolation\nAnd it looks like I'm the queen\n\nThe wind is howling like this swirling storm inside\nCouldn't keep it in, heaven knows I tried\n\nDon't let them in, don't let them see\nBe the good girl you always have to be\nConceal, don't feel, don't let them know\nWell, now they know\n\nLet it go, let it go\nCan't hold it back anymore\nLet it go, let it go\nTurn away and slam the door\n\nI don't care what they're going to say\nLet the storm rage on\nThe cold never bothered me anyway\n\nIt's funny how some distance\nMakes everything seem small\nAnd the fears that once controlled me\nCan't get to me at all\n\nIt's time to see what I can do\nTo test the limits and break through\nNo right, no wrong, no rules for me\nI'm free\n\nLet it go, let it go\nI am one with the wind and sky\nLet it go, let it go\nYou'll never see me cry\n\nHere I stand and here I'll stay\nLet the storm rage on\n\nMy power flurries through the air into the ground\nMy soul is spiraling in frozen fractals all around\nAnd one thought crystallizes like an icy blast\nI'm never going back, the past is in the past\n\nLet it go, let it go\nAnd I'll rise like the break of dawn\nLet it go, let it go\nThat perfect girl is gone\n\nHere I stand in the light of day\nLet the storm rage on\nThe cold never bothered me anyway`
      },
      {
        id: 'how-far-ill-go',
        title: 'How Far I\'ll Go',
        movie: 'Moana',
        lyrics: `I've been staring at the edge of the water\nLong as I can remember\nNever really knowing why\nI wish I could be the perfect daughter\nBut I come back to the water\nNo matter how hard I try\n\nEvery turn I take, every trail I track\nEvery path I make, every road leads back\nTo the place I know where I cannot go\nWhere I long to be\n\nSee the line where the sky meets the sea?\nIt calls me\nAnd no one knows\nHow far it goes\n\nIf the wind in my sail on the sea stays behind me\nOne day I'll know\nIf I go there's just no telling how far I'll go\n\nI know everybody on this island\nSeems so happy on this island\nEverything is by design\nI know everybody on this island\nHas a role on this island\nSo maybe I can roll with mine\n\nI can lead with pride, I can make us strong\nI'll be satisfied if I play along\nBut the voice inside sings a different song\nWhat is wrong with me?\n\nSee the light as it shines on the sea?\nIt's blinding\nBut no one knows\nHow deep it goes\n\nAnd it seems like it's calling out to me\nSo come find me\nAnd let me know\nWhat's beyond that line, will I cross that line?\n\nThe line where the sky meets the sea?\nIt calls me\nAnd no one knows\nHow far it goes\n\nIf the wind in my sail on the sea stays behind me\nOne day I'll know\nHow far I'll go`
      },
      {
        id: 'into-the-unknown',
        title: 'Into the Unknown',
        movie: 'Frozen 2',
        lyrics: `Ah-ah, oh-oh, oh-oh, oh-oh, oh-oh\nAh-ah, oh-oh, oh-oh, oh-oh\n\nI can hear you, but I won't\nSome look for trouble, while others don't\nThere's a thousand reasons I should go about my day\nAnd ignore your whispers, which I wish would go away, oh-oh, oh\n\nAh-ah, oh-oh\nYou're not a voice, you're just a ringing in my ear\nAnd if I heard you, which I don't, I'm spoken for, I fear\nEveryone I've ever loved is here within these walls\nI'm sorry, secret siren, but I'm blocking out your calls\n\nI've had my adventure, I don't need something new\nI'm afraid of what I'm risking if I follow you\n\nInto the unknown\nInto the unknown\nInto the unknown\n\nAh-ah, oh-oh, oh-oh\nAh-ah, oh-oh, oh-oh, oh-oh\n\nWhat do you want? 'Cause you've been keeping me awake\nAre you here to distract me so I make a big mistake?\nOr are you someone out there who's a little bit like me?\nWho knows deep down I'm not where I'm meant to be?\n\nEvery day's a little harder as I feel my power grow\nDon't you know there's part of me that longs to go\n\nInto the unknown\nInto the unknown\nInto the unknown\n\nAh-ah, oh-oh\nAh-ah, oh-oh\n\nAre you out there?\nDo you know me?\nCan you feel me?\nCan you show me?\n\nAh-ah, oh-oh\nAh-ah, oh-oh\nAh-ah, oh-oh\nAh-ah, oh-oh\nAh-ah, oh-oh\n\nWhere are you going? Don't leave me alone\nHow do I follow you\nInto the unknown?`
      },
      {
        id: 'we-dont-talk-bruno',
        title: 'We Don\'t Talk About Bruno',
        movie: 'Encanto',
        lyrics: `We don't talk about Bruno, no, no, no\nWe don't talk about Bruno\nBut\n\nIt was my wedding day\nIt was our wedding day\nWe were getting ready\nAnd there wasn't a cloud in the sky\nNo clouds allowed in the sky\n\nBruno walks in with a mischievous grin\nThunder!\nYou telling this story or am I?\nI'm sorry, mi vida, go on\n\nBruno says, "It looks like rain"\nWhy did he tell us?\nIn doing so, he floods my brain\nAbuela, get the umbrellas\nMarried in a hurricane\nWhat a joyous day but anyway\n\nWe don't talk about Bruno, no, no, no\nWe don't talk about Bruno\n\nHey, grew to live in fear of Bruno stuttering or stumbling\nI can always hear him sort of muttering and mumbling\nI associate him with the sound of falling sand, ch ch ch\nIt's a heavy lift with a gift so humbling\nAlways left Abuela and the family fumbling\nGrappling with prophecies they couldn't understand\nDo you understand?\n\nA seven-foot frame, rats along his back\nWhen he calls your name it all fades to black\nYeah, he sees your dreams and feasts on your screams\nHey\n\nWe don't talk about Bruno, no, no, no\nWe don't talk about Bruno\n\nHe told me my fish would die, the next day, dead\nNo, no\nHe told me I'd grow a gut and just like he said\nNo, no\nHe said that all my hair would disappear\nNow, look at my head\nNo, no\nYour fate is sealed when your prophecy is read\n\nHe told me that the life of my dreams\nWould be promised, and someday be mine\nHe told me that my power would grow\nLike the grapes that thrive on the vine\n\nI'm fine, and I'm fine, and I'm fine, I'm fine\nHe's here\n\nDon't talk about Bruno, no\nWhy did I talk about Bruno?\nNot a word about Bruno\nI never should have brought up Bruno`
      },
      {
        id: 'a-whole-new-world',
        title: 'A Whole New World',
        movie: 'Aladdin',
        lyrics: `I can show you the world\nShining, shimmering, splendid\nTell me, princess, now when did you\nLast let your heart decide?\n\nI can open your eyes\nTake you wonder by wonder\nOver, sideways and under\nOn a magic carpet ride\n\nA whole new world\nA new fantastic point of view\nNo one to tell us no\nOr where to go\nOr say we're only dreaming\n\nA whole new world\nA dazzling place I never knew\nBut when I'm way up here\nIt's crystal clear\nThat now I'm in a whole new world with you\n\nNow I'm in a whole new world with you\n\nUnbelievable sights\nIndescribable feeling\nSoaring, tumbling, freewheeling\nThrough an endless diamond sky\n\nA whole new world\nDon't you dare close your eyes\nA hundred thousand things to see\nHold your breath, it gets better\nI'm like a shooting star\nI've come so far\nI can't go back to where I used to be\n\nA whole new world\nWith new horizons to pursue\nI'll chase them anywhere\nThere's time to spare\nLet me share this whole new world with you\n\nA whole new world\nA whole new world\nThat's where we'll be\nThat's where we'll be\nA thrilling chase\nA wondrous place\nFor you and me`
      },
      {
        id: 'under-the-sea',
        title: 'Under the Sea',
        movie: 'The Little Mermaid',
        lyrics: `The seaweed is always greener\nIn somebody else's lake\nYou dream about going up there\nBut that is a big mistake\n\nJust look at the world around you\nRight here on the ocean floor\nSuch wonderful things surround you\nWhat more is you lookin' for?\n\nUnder the sea, under the sea\nDarling, it's better down where it's wetter\nTake it from me\n\nUp on the shore they work all day\nOut in the sun they slave away\nWhile we devotin' full time to floatin'\nUnder the sea\n\nDown here all the fish is happy\nAs off through the waves they roll\nThe fish on the land ain't happy\nThey sad 'cause they in the bowl\n\nBut fish in the bowl is lucky\nThey in for a worser fate\nOne day when the boss get hungry\nGuess who gon' be on the plate?\n\nUnder the sea, under the sea\nNobody beat us, fry us and eat us\nIn fricassee\n\nWe what the land folks loves to cook\nUnder the sea we off the hook\nWe got no troubles, life is the bubbles\nUnder the sea\nUnder the sea\n\nSince life is sweet here\nWe got the beat here naturally\nEven the sturgeon and the ray\nThey get the urge 'n start to play\n\nWe got the spirit, you got to hear it\nUnder the sea\n\nThe newt play the flute\nThe carp play the harp\nThe plaice play the bass\nAnd they soundin' sharp\n\nThe bass play the brass\nThe chub play the tub\nThe fluke is the duke of soul\nThe ray he can play\nThe ling's on the strings\nThe trout rockin' out\nThe blackfish she sings\n\nThe smelt and the sprat\nThey know where it's at\nAn' oh, that blowfish blow\n\nUnder the sea\nUnder the sea\nWhen the sardine begin the beguine\nIt's music to me\n\nWhat do they got, a lot of sand?\nWe got a hot crustacean band\nEach little clam here know how to jam here\nUnder the sea\n\nEach little slug here cuttin' a rug here\nUnder the sea\nEach little snail here know how to wail here\nThat's why it's hotter under the water\nYa we in luck here down in the muck here\nUnder the sea`
      },
      {
        id: 'circle-of-life',
        title: 'Circle of Life',
        movie: 'The Lion King',
        lyrics: `Nants ingonyama bagithi baba\nSithi uhm ingonyama\nNants ingonyama bagithi baba\nSithi uhhmm ingonyama\nIngonyama\n\nSiyo nqoba\nIngonyama\nIngonyama nengw' enamabala\nIngonyama nengw' enamabala\nIngonyama nengw' enamabala\nIngonyama nengw' enamabala\n\nFrom the day we arrive on the planet\nAnd blinking, step into the sun\nThere's more to see than can ever be seen\nMore to do than can ever be done\n\nThere's far too much to take in here\nMore to find than can ever be found\nBut the sun rolling high\nThrough the sapphire sky\nKeeps great and small on the endless round\n\nIt's the circle of life\nAnd it moves us all\nThrough despair and hope\nThrough faith and love\n\n'Til we find our place\nOn the path unwinding\nIn the circle\nThe circle of life\n\nIt's the circle of life\nAnd it moves us all\nThrough despair and hope\nThrough faith and love\n\n'Til we find our place\nOn the path unwinding\nIn the circle\nThe circle of life`
      },
      {
        id: 'part-of-your-world',
        title: 'Part of Your World',
        movie: 'The Little Mermaid',
        lyrics: `Look at this stuff, isn't it neat?\nWouldn't you think my collection's complete?\nWouldn't you think I'm the girl\nThe girl who has everything?\n\nLook at this trove, treasures untold\nHow many wonders can one cavern hold?\nLooking around here you'd think\nSure, she's got everything\n\nI've got gadgets and gizmos a-plenty\nI've got whozits and whatzits galore\nYou want thingamabobs? I've got twenty\nBut who cares? No big deal\nI want more\n\nI wanna be where the people are\nI wanna see, wanna see 'em dancin'\nWalkin' around on those, what do you call 'em?\nOh, feet\n\nFlippin' your fins, you don't get too far\nLegs are required for jumpin', dancin'\nStrollin' along down a, what's that word again?\nStreet\n\nUp where they walk, up where they run\nUp where they stay all day in the sun\nWanderin' free, wish I could be\nPart of that world\n\nWhat would I give if I could live\nOut of these waters?\nWhat would I pay to spend a day\nWarm on the sand?\n\nBet'cha on land they understand\nBet they don't reprimand their daughters\nBright young women, sick of swimmin'\nReady to stand\n\nAnd ready to know what the people know\nAsk 'em my questions and get some answers\nWhat's a fire and why does it, what's the word?\nBurn\n\nWhen's it my turn?\nWouldn't I love, love to explore that shore up above?\nOut of the sea\nWish I could be\nPart of that world`
      }
    ],
    kpop: [
      {
        id: 'dynamite',
        title: 'Dynamite',
        artist: 'BTS',
        lyrics: `'Cause I, I, I'm in the stars tonight\nSo watch me bring the fire and set the night alight\n\nShoes on, get up in the morn'\nCup of milk, let's rock and roll\nKing Kong, kick the drum\nRolling on like a Rolling Stone\n\nSing song when I'm walking home\nJump up to the top, LeBron\nDing-dong, call me on my phone\nIce tea and a game of ping pong\n\nThis is getting heavy\nCan you hear the bass boom? I'm ready\nLife is sweet as honey\nYeah, this beat cha-ching like money\n\nDisco overload, I'm into that, I'm good to go\nI'm diamond, you know I glow up\nHey, so let's go\n\n'Cause I, I, I'm in the stars tonight\nSo watch me bring the fire and set the night alight\nShining through the city with a little funk and soul\nSo I'ma light it up like dynamite, woah\n\nBring a friend, join the crowd, whoever wanna come along\nWord up, talk the talk, just move like we off the wall\nDay or night, the sky's alight, so we dance to the break of dawn\nLadies and gentlemen, I got the medicine so you should keep ya eyes on the ball\n\nThis is getting heavy, can you hear the bass boom? I'm ready\nLife is sweet as honey, yeah, this beat cha-ching like money\nDisco overload, I'm into that, I'm good to go\nI'm diamond, you know I glow up\n\nLet's go\n\n'Cause I, I, I'm in the stars tonight\nSo watch me bring the fire and set the night alight\nShining through the city with a little funk and soul\nSo I'ma light it up like dynamite, woah\n\nDy-na-na-na, na-na-na-na-na, na-na-na, life is dynamite\nDy-na-na-na, na-na-na-na-na, na-na-na, life is dynamite\nShining through the city with a little funk and soul\nSo I'ma light it up like dynamite, woah\n\nDy-na-na-na, na-na, na-na, ayy\nDy-na-na-na, na-na, na-na, ayy\nDy-na-na-na, na-na, na-na, ayy\nLight it up like dynamite\n\n'Cause I, I, I'm in the stars tonight\nSo watch me bring the fire and set the night alight\nShining through the city with a little funk and soul\nSo I'ma light it up like dynamite\n\n'Cause I, I, I'm in the stars tonight\nSo watch me bring the fire and set the night alight\nShining through the city with a little funk and soul\nSo I'ma light it up like dynamite, woah`
      },
      {
        id: 'butter',
        title: 'Butter',
        artist: 'BTS',
        lyrics: `Smooth like butter\nLike a criminal undercover\nGon' pop like trouble\nBreaking into your heart like that (ooh)\n\nCool shade, stunner\nYeah, I owe it all to my mother\nHot like summer\nYeah, I'm making you sweat like that\n\nBreak it down\n\nOh, when I look in the mirror\nI'll melt your heart into two\nI got that superstar glow, so (ooh)\n\nDo the boogie, like\nSide step, right-left, to my beat\nHigh like the moon, rock with me, baby\nKnow that I got that heat\n\nLet me show you 'cause talk is cheap\nSide step, right-left, to my beat\nGet it, let it roll\n\nSmooth like butter\nPull you in like no other\nDon't need no Usher\nTo remind me you got it bad\n\nAin't no other\nThat can sweep you up like a robber\nStraight up, I got ya\nMaking you fall like that\n\nBreak it down\n\nOh, when I look in the mirror\nI'll melt your heart into two\nI got that superstar glow, so (ooh)\n\nDo the boogie, like\nSide step, right-left, to my beat\nHigh like the moon, rock with me, baby\nKnow that I got that heat\n\nLet me show you 'cause talk is cheap\nSide step, right-left, to my beat\nGet it, let it roll\n\nGet it, let it roll\nGet it, let it roll\n\nSmooth like butter\nLike a criminal undercover\nGon' pop like trouble\nBreaking into your heart like that\n\nCool shade, stunner\nYeah, I owe it all to my mother\nHot like summer\nYeah, I'm making you sweat like that\n\nBreak it down\n\nDon't need no Usher\nTo remind me you got it bad\nStraight up, I got ya\nMaking you fall like that`
      },
      {
        id: 'how-you-like-that',
        title: 'How You Like That',
        artist: 'BLACKPINK',
        lyrics: `BLACKPINK in your area\nBLACKPINK in your area\n\n보란 듯이 무너졌어\n바닥을 뚫고 저 지하까지\n옷 끝자락 잡겠다고\n저 높이 두 손을 뻗어봐도\n\n다시 캄캄한 이곳에 light up the sky\n네 두 눈을 보며 I'll kiss you goodbye\n실컷 비웃어라 꼴좋으니까\n이제 너희 하나 둘 셋\n\nHa how you like that?\nYou gon' like that, that that that, that, that that that\nHow you like that? (Bada bing, bada boom, boom, boom)\nHow you like that, that that that, that, that that that\n\nNow look at you, now look at me\nLook at you, now look at me\nLook at you, now look at me\nHow you like that?\n\nNow look at you, now look at me\nLook at you, now look at me\nLook at you, now look at me\nHow you like that?\n\nYour girl need it all and that's a hundred\n백 개 중에 백 내 몫\n잡아봐 팔이 길어 네 다리 위기는 좀 높지\n저번엔 못 잡아 줘 너무 있어야 할게\n바람이 불기에도 바빴어 과거에 얽매인 나\n\n다 뭘 어쩌라고\n어디로 튈지 모르는 나의 공\nYeah you might wanna bail on me now\n(Ooh) You gon' have to make what I do now\n\nHow you like that?\nHow you like that?\n\n날 잡아라 못할 걸\n웃 버릇이 나빠 I talk that talk\nRundredda like my dollar sign\nSure you do but I fly over\nYou keep on dying down below\nYou gon' like that that that that that\nThat that that that\nHow you like that?\n\nHow you like that?\nYou gon' like that, that that that, that, that that that\nHow you like that? (Bada bing, bada boom, boom, boom)\nHow you like that, that that that, that, that that that`
      },
      {
        id: 'pink-venom',
        title: 'Pink Venom',
        artist: 'BLACKPINK',
        lyrics: `Kick in the door, waving the coco\nPapillon, find it, I go\nVroom, vroom, vroom, vroom\n\nChasin' desires like I'm a Dеsperado\nAll I ever wanted, money and fame\nTaste that pink venom, taste that pink venom\nTaste that pink venom, get 'em, get 'em, get 'em\n\nStraight to ya dome like woah, woah, woah\nStraight to ya dome like ah, ah, ah\n태양을 삼킨 눈빛 (한 입)\nCrazy, crazy, crazy\n\nEvery day, every night (Oh)\n내 독을 품은 꽃 (Oh)\nYou're in love\n주입하는 독침\nBlack paint and ammo\nGot bodies like Rambo\n\nRest in peace, please\nLight up the peace, please\n불을 밝힌 게임\nLet 'em have it\nYou want it?\nCome and get it\n\nTaste that pink venom, taste that pink venom\nTaste that pink venom, get 'em, get 'em, get 'em\nStraight to ya dome like woah, woah, woah\nStraight to ya dome like ah, ah, ah\n태양을 삼킨 눈빛 (한 입)\nCrazy, crazy, crazy\n\nOne by one, then two by two\n내 손끝엔 눈물 흘린 두 배\nHere I come, kickin' the door, uh\nApex predator, I'm locked and I'm loaded\nAbsolutely, I'm gonna steal it\nShow you what it means to be a baddie\n\nTaste that pink venom, taste that pink venom\nTaste that pink venom, get 'em, get 'em, get 'em\nStraight to ya dome like woah, woah, woah\nStraight to ya dome like ah, ah, ah\n태양을 삼킨 눈빛 (한 입)\nCrazy, crazy, crazy\n\nBLACKPINK, BLACKPINK\nBLACKPINK, BLACKPINK`
      },
      {
        id: 'step-back',
        title: 'Step Back',
        artist: 'GOT the beat',
        lyrics: `Step back, step back\nGonna come right back\nStep back, step back\nToo much in fact\n\nComing at you live, GTB\nReal women, making money\nAll my ladies in the place, let me see you work\nYou know who we are, we're the real boss girls\n\nOn the beat, yeah, we beat 'em up\nThirsty for the world, yeah, we eat it up\nLast one standing, you can't compete with us\nWhat you lookin' at? Yeah, it's me, that's what's up\n\nGirls bring the heat like hot chili pepper\nAlways look fresh on the latest endeavor\nSavage as ever, you can call us queens\nPut it on ya like it's mine, mine, mine\n\nTap out, it's over\nGive me your love, I'll run it like a rover\nAdrenaline rollin', now you know it's time to\nStep back, better run, better know, better go, go\n\nStep back, step back\nGonna come right back\nStep back, step back (Ooh)\n\nLet me drop it down low, drop it down like this\nSexy, confident, yeah, we on that list\nTop of the class, yeah, we the real hit\nLove the way we're making you step back\n\nBetter step back\nGonna come right back\nStep back, step back\nToo much in fact`
      },
      {
        id: 'signal',
        title: 'Signal',
        artist: 'TWICE',
        lyrics: `Ooh-ooh, ooh, ooh-ooh, ooh\nOoh-ooh, ooh, ooh-ooh, ooh\n\nI'm trying so hard to let you know (보내고 있어)\nBut you just don't seem to get it (맘이 가는 건)\n\nSignal, signal\nI'm sending you a signal\nSignal, signal (Signal)\nCan you feel my signal?\n\nLala-lala-lala-lala-la\nLala-lala-lala-lala-la\nLala-lala-lala-lala-la\nSignal, can you feel my signal?\n\n나의 눈빛을 봐\nDon't you see it?\n너무 뚜렷한 나의 신호를\nYou don't notice it\n\nSo I'm gonna send you a signal\nHope you catch it\nThat I'm sending you my signal\nCan you see it now?\n\n시그널 보내 시그널 보내\nMy feelings for you\n시그널 보내 시그널 보내\nI'm hoping you knew\n\nSignal, signal\nI'm sending you a signal\nSignal, signal\nCan you feel my signal?\n\nLala-lala-lala-lala-la\nLala-lala-lala-lala-la\nLala-lala-lala-lala-la\nSignal, can you feel my signal?\n\n모르는 척 안 해도 돼\nI know you know\n느껴지면서 그냥 보는 척만 해\nWhat do I do?\n\nSo I'm gonna send you a signal\nHope you catch it\nThat I'm sending you my signal\nCan you see it now?\n\n시그널 보내 시그널 보내\nMy feelings for you\n시그널 보내 시그널 보내\nI'm hoping you knew\n\nSignal, signal\nI'm sending you a signal\nSignal, signal\nCan you feel my signal?`
      },
      {
        id: 'dalla-dalla',
        title: 'DALLA DALLA',
        artist: 'ITZY',
        lyrics: `Speak up, speak up, speak up, speak up\nSpeak up, speak up, yeah\n\nI'm different, you're different\nI'm different, dalla dalla\nI'm different, you're different\nI'm different, dalla dalla\n\nI wanna do what I wanna do\nI wanna be who I wanna be\n나의 거울 속엔 내가 yeah, yeah\n정답이 없는 문제 yeah, yeah\n\nDo whatever I wanna do\nGo wherever I wanna go\nOoh-ooh-ooh-ooh-ooh\nYou ain't got nothin' on me\n\nAll my ladies put your hands up\nHigh, high, 어딜 봐? I'm here\nAll my ladies put your hands up\nHigh, high, I'm talkin' to you now\n\nI'm different, you're different\nI'm different, dalla dalla\nI'm different, you're different\nI'm different, dalla dalla (What?)\n\nI like myself, don't care 'bout you\nIt's all in my head, that's all, uh\nAll my ladies put your hands up\nHigh, high, you got me now\n\nDon't compare yourself to me\nI'm one of a kind, baby, you will see\n나는 나니까, yeah, yeah\n답이 없는 test, yeah, yeah\n\nDo whatever I wanna do\nGo wherever I wanna go\nOoh-ooh-ooh-ooh-ooh\nYou ain't got nothin' on me\n\nAll my ladies put your hands up\nHigh, high, 어딜 봐? I'm here\nAll my ladies put your hands up\nHigh, high, I'm talkin' to you now\n\nI'm different, you're different\nI'm different, dalla dalla\nI'm different, you're different\nI'm different, dalla dalla\n\nI like myself, don't care 'bout you\nIt's all in my head, that's all, uh\nAll my ladies put your hands up\nHigh, high, you got me now`
      },
      {
        id: 'next-level',
        title: 'Next Level',
        artist: 'aespa',
        lyrics: `I'm on the next level, yeah\nNext level, yeah\n절대 멈추지 않아\nNext level, yeah\n\nI see the NU EVO\nThat's my want, my want\n모든 걸 다 가져와\nThat's my want, my want\n\nPOS-POS-POS-POSÉ\nPos-pos-pos-posé\nTake it to the TOP\nThat's my want, my want\n\nKeep it going up, up, up, up, up (Ay)\nEvery day we levelin' up (Ay)\nTook it to the top\nNow we goin' up, up (Ayy)\n\nToo hot, too hot\n이제 더는 참을 수 없어\nToo high, so high\n벗어날 수 없어\nCan't get enough\n\nNew world, new world\n모든 게 내 것이 될 때까지\nJust bring it, bring it, bring it on\nYeah, we got it going on\n\nI'm on the next level\nNever gonna look back\n다음 차원으로 가자\n나의 pace로\n\nNext level\n절대 멈추지 않아\n광야로 걸어가\nNext level, that's my word\n\nI see the NU EVO\nThat's my want, my want\n모든 걸 다 가져와\nThat's my want, my want\n\nPOS-POS-POS-POSÉ\nPos-pos-pos-posé\nTake it to the TOP\nThat's my want, my want\n\nNow I'm in the KWANGYA\nI got my ae, ae, ae, ae, ae (Oh)\nWhere my FLAT (Huh)\nMy way on the KWANGYA (Ay)\n\nI see the NU EVO\nFlat on the GROUND, REAL MY WORLD, KWANGYA\nCan't just stay with me\n새롭게 펼쳐져 on the GROUND, REAL MY WORLD, KWANGYA (Oh)\n\nCome on over, bring it on over\n그 다음 다음 다음 level, yeah\nCome on over, bring it on over (What?)\n\nI'm on the next level (Yeah)\nI'm on the next level (Yeah)\n절대 멈추지 않아 (Ayy, oh)\nNext level (Next level)\n광야로 걸어가 (Ay, ay, oh)\nNext level\n절대 멈추지 않아\n광야로 걸어가\nNext level, that's my word`
      },
      {
        id: 'golden',
        title: 'Golden',
        artist: 'Jungkook (BTS)',
        lyrics: `I know, you know, we know\nWe weren't meant for each other and it's fine\nBut if the world was ending\nYou'd come over, right?\nYou'd come over and you'd stay the night\nWould you love me for the hell of it?\nAll our fears would be irrelevant\n\nIf the world was ending\nYou'd come over, right?\nThe sky'd be falling and I'd hold you tight\nAnd there wouldn't be a reason why\nWe would even have to say goodbye\n\nIf the world was ending\nYou'd come over, right? Right?\nIf the world was ending\nYou'd come over, right? Right?\n\nI tried to imagine\nYour reaction\nIt didn't scare me when the earthquake happened\nBut it really got me thinkin'\nWere you out drinkin'?\nWere you in the living room\nChillin' watchin' television?\nIt's been a year now\nThink I've figured out how\nHow to let you go and let communication die out\n\nI know, you know, we know\nYou weren't even here to begin with\nBut if the world was ending\nYou'd come over, right?\nYou'd come over and you'd stay the night\nWould you love me for the hell of it?\nAll our fears would be irrelevant\n\nIf the world was ending\nYou'd come over, right?\nThe sky'd be falling while I'd hold you tight\nNo, there wouldn't be a reason why\nWe would even have to say goodbye\n\nIf the world was ending\nYou'd come over, right?\nYou'd come over, right?\nYou'd come over, you'd come over, you'd come over, right?\n\nI know, you know, we know\nWe weren't meant for each other and it's fine\nBut if the world was ending\nYou'd come over, right?\nYou'd come over and you'd stay the night\nWould you love me for the hell of it?\nAll our fears would be irrelevant\n\nIf the world was ending\nYou'd come over, right?\nThe sky'd be falling and I'd hold you tight\nAnd there wouldn't be a reason why\nWe would even have to say goodbye\n\nIf the world was ending\nYou'd come over, right?\nYou'd come over, you'd come over, you'd come over, right?`
      }
    ],
    other: [
      { id: 'custom', title: 'My Own Song!', artist: 'Custom', lyrics: '' }
    ]
  }

  const categoryOptions = [
    { id: 'disney', name: 'Disney Classics', icon: '🏰', description: 'Sing your favorite Disney songs!' },
    { id: 'kpop', name: 'K-Pop Hits', icon: '💜', description: 'Dance and sing K-pop favorites!' },
    { id: 'other', name: 'My Own Song', icon: '🎤', description: 'Sing any song you want!' }
  ]

  // Request microphone permission on mount
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        console.log('✅ Microphone permission granted for Musical Maestro')
      } catch (err) {
        console.error('❌ Microphone permission denied:', err)
        setError('Microphone permission is required for this game. Please allow access in your browser settings.')
      }
    }

    requestMicPermission()
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)

        setRecordingBlob(audioBlob)
        setRecordingUrl(audioUrl)
        setHasRecording(true)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())

        // Clear timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
          timerIntervalRef.current = null
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      recordingStartTimeRef.current = Date.now()

      // Start timer and lyrics scroll
      const currentSong = getCurrentSongInfo()
      const totalLines = currentSong?.lyrics?.split('\n').length || 0

      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
        setRecordingDuration(elapsed)

        // Auto-scroll lyrics (roughly 3 seconds per line)
        if (totalLines > 0) {
          const newLine = Math.min(Math.floor(elapsed / 3), totalLines - 1)
          setCurrentLine(newLine)

          // Scroll the lyrics container
          if (lyricsRef.current) {
            const lineHeight = 56 // approximate height of each line
            lyricsRef.current.scrollTop = newLine * lineHeight - 100 // offset to keep current line visible
          }
        }
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Microphone access denied. Please allow microphone permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setCurrentLine(0)
    }
  }

  const handleGenerateReview = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const songInfo = songCategory === 'other'
        ? `"${customSongTitle}" by ${customArtist}`
        : songLibrary[songCategory].find(s => s.id === selectedSong)?.title || 'a song'

      // Call Claude to generate a fun performance review
      const result = await generateWithRateLimit({
        userInput: `Create a fun, encouraging performance review for ${singerName}`,
        gameContext: 'musical-maestro',
        additionalData: {
          singerName,
          song: songInfo,
          category: songCategory,
          duration: recordingDuration
        },
        maxTokens: 1024,
        temperature: 0.9
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate review')
      }

      // Parse the review
      const review = parseReviewResponse(result.content)
      setGeneratedReview(review)
      setReviewGenerated(true)

      // Save to gallery
      saveToGallery({
        gameName: 'Musical Maestro',
        data: { review, singerName, songInfo },
        preview: `${singerName}'s performance of ${songInfo}`
      })

      window.scrollTo({ top: 600, behavior: 'smooth' })

    } catch (err) {
      console.error('Error generating review:', err)
      setError('AI review unavailable. Using backup review system.')

      // Fallback review
      const review = generateFallbackReview()
      setGeneratedReview(review)
      setReviewGenerated(true)

      window.scrollTo({ top: 600, behavior: 'smooth' })
    } finally {
      setIsGenerating(false)
    }
  }

  const parseReviewResponse = (content) => {
    // Try to parse structured review from Claude
    const starMatch = content.match(/(\d+)[\s\/]*(?:out of )?5 stars/i)
    const stars = starMatch ? parseInt(starMatch[1]) : 5

    // Extract sections
    const highlightMatch = content.match(/(?:highlight|best part|amazing)[:\s]*([^\n]+)/i)
    const improvementMatch = content.match(/(?:improvement|practice|next time)[:\s]*([^\n]+)/i)

    return {
      stars,
      title: `${singerName}, You Were Amazing!`,
      highlight: highlightMatch?.[1]?.trim() || "Your passion and energy were incredible! You really felt the music!",
      encouragement: "Keep singing! Every performance makes you better!",
      improvement: improvementMatch?.[1]?.trim() || "Keep practicing and you'll be even more amazing!",
      badges: generateBadges(stars),
      fullReview: content
    }
  }

  const generateFallbackReview = () => {
    const stars = 4 + Math.round(Math.random()) // 4 or 5 stars

    const highlights = [
      "Your energy was infectious! You really connected with the song!",
      "Wow! Your passion for music really shines through!",
      "You have such a unique voice! Keep sharing it with the world!",
      "Amazing! You put your whole heart into that performance!",
      "Incredible! You made that song your own!"
    ]

    const encouragements = [
      "You're a natural performer! Keep singing every day!",
      "Your confidence is growing with every song!",
      "Music is clearly one of your superpowers!",
      "You have what it takes to be a star!",
      "Keep practicing and you'll achieve anything!"
    ]

    const improvements = [
      "Try recording yourself and listening back - you'll be amazed!",
      "Keep practicing your favorite parts until they feel perfect!",
      "Remember to breathe and project your voice!",
      "Try singing along with the original to learn the rhythm!"
    ]

    return {
      stars,
      title: `${singerName}, You Were Amazing!`,
      highlight: highlights[Math.floor(Math.random() * highlights.length)],
      encouragement: encouragements[Math.floor(Math.random() * encouragements.length)],
      improvement: improvements[Math.floor(Math.random() * improvements.length)],
      badges: generateBadges(stars)
    }
  }

  const generateBadges = (stars) => {
    const allBadges = [
      { emoji: '🎤', text: 'Microphone Master' },
      { emoji: '🌟', text: 'Rising Star' },
      { emoji: '💖', text: 'Heart & Soul' },
      { emoji: '🎵', text: 'Melody Maker' },
      { emoji: '🔥', text: 'Show Stopper' },
      { emoji: '👑', text: 'Karaoke Queen' },
      { emoji: '🎭', text: 'Natural Performer' },
      { emoji: '✨', text: 'Stage Presence' }
    ]

    // Award badges based on stars
    const badgeCount = Math.min(stars, 3)
    const shuffled = [...allBadges].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, badgeCount)
  }

  const downloadRecording = () => {
    if (recordingBlob) {
      const url = URL.createObjectURL(recordingBlob)
      const link = document.createElement('a')
      link.href = url
      const songName = songCategory === 'other' ? customSongTitle : songLibrary[songCategory].find(s => s.id === selectedSong)?.title
      link.download = `${singerName}-${songName}-${new Date().toISOString().slice(0, 10)}.webm`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const canRecord = singerName && (
    (songCategory === 'other' && customSongTitle && customArtist) ||
    (songCategory !== 'other' && selectedSong)
  )

  const getCurrentSongInfo = () => {
    if (songCategory === 'other') {
      return {
        title: customSongTitle,
        artist: customArtist,
        lyrics: customLyrics
      }
    }
    return songLibrary[songCategory]?.find(s => s.id === selectedSong)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Games</span>
            </Link>
            <div className="flex items-center gap-2 text-purple-600">
              <ClockIcon className="w-5 h-5" />
              <span className="text-sm font-medium">20 min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <MusicalNoteIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Musical Maestro
          </h1>
          <p className="text-xl text-gray-600">
            Sing your heart out and get a star-studded review!
          </p>
        </div>

        {!reviewGenerated ? (
          /* Song Selection & Recording */
          <div className="space-y-8">
            {/* Singer Info */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <SparklesIcon className="w-7 h-7 text-purple-500" />
                About You
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Singer's Name
                </label>
                <input
                  type="text"
                  value={singerName}
                  onChange={(e) => setSingerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MusicalNoteIcon className="w-7 h-7 text-purple-500" />
                Choose Your Style
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSongCategory(cat.id)
                      setSelectedSong('')
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      songCategory === cat.id
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <div className="font-bold text-gray-900 mb-1">{cat.name}</div>
                    <div className="text-sm text-gray-600">{cat.description}</div>
                  </button>
                ))}
              </div>

              {/* Song Selection */}
              {songCategory === 'other' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Song Title
                    </label>
                    <input
                      type="text"
                      value={customSongTitle}
                      onChange={(e) => setCustomSongTitle(e.target.value)}
                      placeholder="Enter song title"
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Artist
                    </label>
                    <input
                      type="text"
                      value={customArtist}
                      onChange={(e) => setCustomArtist(e.target.value)}
                      placeholder="Enter artist name"
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lyrics (Optional)
                    </label>
                    <textarea
                      value={customLyrics}
                      onChange={(e) => setCustomLyrics(e.target.value)}
                      placeholder="Paste the lyrics here to see them while you sing..."
                      rows={8}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Paste the lyrics so you can read them karaoke-style while recording!
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Pick Your Song
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {songLibrary[songCategory]?.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => setSelectedSong(song.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedSong === song.id
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="font-bold text-gray-900">{song.title}</div>
                        <div className="text-sm text-gray-600">
                          {song.movie || song.artist}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Karaoke Lyrics Display */}
            {canRecord && (() => {
              const currentSong = songCategory === 'other'
                ? { lyrics: customLyrics }
                : songLibrary[songCategory]?.find(s => s.id === selectedSong)

              const lyrics = currentSong?.lyrics || ''

              if (!lyrics) return null

              return (
                <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MusicalNoteIcon className="w-7 h-7 text-purple-500" />
                    Lyrics {isRecording && <span className="text-sm text-purple-600 font-normal ml-2">(Auto-scrolling)</span>}
                  </h2>
                  <div className={`bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl overflow-hidden ${
                    isRecording ? 'ring-4 ring-purple-400' : ''
                  }`}>
                    <div
                      ref={lyricsRef}
                      className="p-8 text-center space-y-3 max-h-96 overflow-y-auto scroll-smooth"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      {lyrics.split('\n').map((line, i) => (
                        <div
                          key={i}
                          className={`text-lg font-semibold transition-all duration-300 py-2 px-4 rounded-xl ${
                            isRecording && i === currentLine
                              ? 'bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 text-gray-900 scale-110 shadow-lg'
                              : isRecording && i < currentLine
                              ? 'text-gray-400 opacity-50'
                              : isRecording && i > currentLine
                              ? 'text-purple-900 opacity-70'
                              : 'text-gray-700'
                          }`}
                          style={{
                            fontSize: isRecording && i === currentLine ? '1.5rem' : '1.125rem',
                            lineHeight: '1.75',
                            minHeight: '3.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {line || '\u00A0'}
                        </div>
                      ))}
                    </div>
                  </div>
                  {isRecording && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-purple-600 font-semibold animate-bounce">
                        🎤 Sing along with the highlighted line!
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Recording Section */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MicrophoneIcon className="w-7 h-7 text-purple-500" />
                Record Your Performance
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-yellow-800 text-sm">⚠️ {error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Recording Timer */}
                {isRecording && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 text-center">
                    <div className="text-6xl font-bold text-red-600 animate-pulse mb-2">
                      {formatTime(recordingDuration)}
                    </div>
                    <div className="text-sm text-gray-600">Recording in progress...</div>
                  </div>
                )}

                {/* Playback */}
                {hasRecording && recordingUrl && !isRecording && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-gray-900">Your Recording:</div>
                      <div className="text-sm text-gray-600">{formatTime(recordingDuration)}</div>
                    </div>
                    <audio
                      src={recordingUrl}
                      controls
                      className="w-full mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={downloadRecording}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Save Recording
                      </button>
                      <button
                        onClick={() => {
                          setHasRecording(false)
                          setRecordingUrl(null)
                          setRecordingBlob(null)
                          setRecordingDuration(0)
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        Record Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Record Button */}
                {!hasRecording && (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!canRecord}
                    className={`w-full py-6 px-8 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                      canRecord
                        ? isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {isRecording ? (
                        <>
                          <StopIcon className="w-8 h-8" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <MicrophoneIcon className="w-8 h-8" />
                          {canRecord ? 'Start Recording' : 'Fill in all fields first'}
                        </>
                      )}
                    </div>
                  </button>
                )}

                {/* Get Review Button */}
                {hasRecording && (
                  <button
                    onClick={handleGenerateReview}
                    disabled={isGenerating}
                    className={`w-full py-4 px-8 rounded-xl font-bold text-lg shadow-lg transition-all ${
                      isGenerating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          Generating Your Review...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-6 h-6" />
                          Get My Review!
                        </>
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Performance Review */
          <div className="space-y-8">
            <div id="musical-maestro-review" className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden">
              {/* Header with Stars */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white text-center">
                <TrophyIcon className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">{generatedReview.title}</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-8 h-8 ${
                        i < generatedReview.stars
                          ? 'fill-yellow-300 text-yellow-300'
                          : 'text-white/30'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xl font-semibold">
                  {generatedReview.stars} out of 5 Stars!
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Badges */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                    You Earned These Badges!
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {generatedReview.badges.map((badge, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl px-4 py-3 flex items-center gap-2"
                      >
                        <span className="text-2xl">{badge.emoji}</span>
                        <span className="font-semibold text-gray-900">{badge.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlight */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                  <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    Performance Highlight
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {generatedReview.highlight}
                  </p>
                </div>

                {/* Encouragement */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <span className="text-2xl">💙</span>
                    Keep Going!
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {generatedReview.encouragement}
                  </p>
                </div>

                {/* Improvement Tip */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
                  <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Pro Tip
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {generatedReview.improvement}
                  </p>
                </div>

                {/* Playback */}
                {recordingUrl && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-3">Listen to Your Performance:</h3>
                    <audio
                      src={recordingUrl}
                      controls
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadRecording}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Save Recording
              </button>
              <div className="flex-1">
                <ShareButton
                  elementId="musical-maestro-review"
                  filename={`${singerName}-performance-review.png`}
                  title={`${singerName}'s Musical Performance`}
                  text={`I got ${generatedReview.stars} stars for my singing! Created with AI Family Night.`}
                />
              </div>
              <button
                onClick={() => {
                  setReviewGenerated(false)
                  setHasRecording(false)
                  setRecordingUrl(null)
                  setRecordingBlob(null)
                  setRecordingDuration(0)
                  setSelectedSong('')
                  setCustomLyrics('')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <SparklesIcon className="w-5 h-5" />
                Sing Another Song
              </button>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Keep the Music Going!
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="font-semibold text-purple-700 mb-2">🎬 Record a Music Video</div>
                  <div className="text-sm text-gray-600">
                    Have a parent film you performing and make your own music video!
                  </div>
                </div>
                <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
                  <div className="font-semibold text-pink-700 mb-2">🎤 Family Karaoke Night</div>
                  <div className="text-sm text-gray-600">
                    Get the whole family together for a karaoke competition!
                  </div>
                </div>
                <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4">
                  <div className="font-semibold text-rose-700 mb-2">📝 Write Your Own Song</div>
                  <div className="text-sm text-gray-600">
                    Try creating your own lyrics and record an original song!
                  </div>
                </div>
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                  <div className="font-semibold text-indigo-700 mb-2">🎵 Practice Makes Perfect</div>
                  <div className="text-sm text-gray-600">
                    Record yourself every week and hear how much you improve!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
