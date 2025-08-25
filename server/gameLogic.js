// Shared game logic for multiplayer Shabble
// This contains the core game mechanics moved from the frontend

const DICTIONARY = [
    'aahs', 'aals', 'abac', 'abas', 'abba', 'abbe', 'abbs', 'abed', 'aber', 'abet',
    'abid', 'able', 'ably', 'abri', 'abut', 'abye', 'abys', 'acai', 'acca', 'aced',
    'acer', 'aces', 'ache', 'achy', 'acid', 'acme', 'acne', 'acre', 'acro', 'acta',
    'acts', 'acyl', 'adaw', 'adds', 'addy', 'adit', 'ados', 'adry', 'adze', 'aeon',
    'aero', 'aery', 'aesc', 'afar', 'affy', 'afro', 'agar', 'agas', 'aged', 'agee',
    'agen', 'ager', 'ages', 'aggy', 'agha', 'agin', 'agio', 'aglu', 'agly', 'agma',
    'agog', 'agon', 'agro', 'ague', 'ahed', 'ahem', 'ahis', 'ahoy', 'aias', 'aida',
    'aide', 'aids', 'aiga', 'ails', 'aims', 'aine', 'ains', 'airn', 'airs', 'airt',
    'airy', 'aits', 'aitu', 'ajar', 'ajee', 'ajis', 'akas', 'aked', 'akee', 'akes',
    'akin', 'alae', 'alan', 'alap', 'alar', 'alas', 'alay', 'alba', 'albe', 'albs',
    'alco', 'alec', 'alee', 'alef', 'ales', 'alew', 'alfa', 'alga', 'algo', 'alif',
    'alit', 'alko', 'alky', 'alls', 'ally', 'alma', 'alme', 'alms', 'alod', 'aloe',
    'aloo', 'alow', 'alps', 'also', 'alto', 'alts', 'alum', 'alus', 'amah', 'amas',
    'ambo', 'amen', 'ames', 'amia', 'amid', 'amie', 'amin', 'amir', 'amis', 'amla',
    'ammo', 'amok', 'amps', 'amus', 'amyl', 'anal', 'anan', 'anas', 'ance', 'ands',
    'anes', 'anew', 'anga', 'anil', 'anis', 'ankh', 'anna', 'anno', 'anns', 'anoa',
    'anon', 'anow', 'ansa', 'anta', 'ante', 'anti', 'ants', 'anus', 'apay', 'aped',
    'aper', 'apes', 'apex', 'apod', 'apos', 'apps', 'apse', 'apso', 'apts', 'aqua',
    'arak', 'arar', 'arba', 'arbs', 'arch', 'arco', 'arcs', 'ards', 'area', 'ared',
    'areg', 'ares', 'aret', 'arew', 'arfs', 'argh', 'aria', 'arid', 'arie', 'aril',
    'aris', 'arks', 'arle', 'arms', 'army', 'arna', 'aros', 'arow', 'arpa', 'arse',
    'arsy', 'arti', 'arts', 'arty', 'arum', 'arvo', 'aryl', 'asar', 'asci', 'asea',
    'ashy', 'asks', 'asps', 'atap', 'ates', 'atma', 'atoc', 'atok', 'atom', 'atop',
    'atua', 'auas', 'aufs', 'augh', 'auks', 'aula', 'auld', 'aune', 'aunt', 'aura',
    'auto', 'aval', 'avas', 'avel', 'aver', 'aves', 'avid', 'avis', 'avos', 'avow',
    'away', 'awdl', 'awed', 'awee', 'awes', 'awfy', 'awks', 'awls', 'awns', 'awny',
    'awol', 'awry', 'axal', 'axed', 'axel', 'axes', 'axil', 'axis', 'axle', 'axon',
    'ayah', 'ayes', 'ayin', 'ayre', 'ayus', 'azan', 'azon', 'azym', 'baal', 'baas',
    'baba', 'babe', 'babu', 'baby', 'bach', 'back', 'bacs', 'bade', 'bads', 'bael',
    'baes', 'baff', 'baft', 'bagh', 'bags', 'baht', 'bahu', 'bail', 'bait', 'baju',
    'bake', 'bald', 'bale', 'balk', 'ball', 'balm', 'bals', 'balu', 'bams', 'banc',
    'band', 'bane', 'bang', 'bani', 'bank', 'bans', 'bant', 'baos', 'baps', 'bapu',
    'barb', 'bard', 'bare', 'barf', 'bark', 'barm', 'barn', 'barp', 'bars', 'basa',
    'base', 'bash', 'bask', 'bass', 'bast', 'bate', 'bath', 'bats', 'batt', 'baud',
    'bauk', 'baur', 'bawd', 'bawk', 'bawl', 'bawn', 'bawr', 'baws', 'baye', 'bays',
    'bayt', 'bazz', 'bead', 'beak', 'beal', 'beam', 'bean', 'bear', 'beat', 'beau',
    'beck', 'bede', 'beds', 'bedu', 'beef', 'been', 'beep', 'beer', 'bees', 'beet',
    'bego', 'begs', 'bein', 'bell', 'bels', 'belt', 'bema', 'bend', 'bene', 'beni',
    'benj', 'bens', 'bent', 'bere', 'berg', 'berk', 'berm', 'best', 'beta', 'bete',
    'beth', 'bets', 'bevy', 'beys', 'bhai', 'bhat', 'bhel', 'bhut', 'bias', 'bibb',
    'bibe', 'bibs', 'bice', 'bide', 'bidi', 'bids', 'bien', 'bier', 'biff', 'biga',
    'bigg', 'bigs', 'bike', 'bile', 'bilk', 'bill', 'bima', 'bind', 'bine', 'bing',
    'bink', 'bins', 'biog', 'bios', 'bird', 'birk', 'birl', 'biro', 'birr', 'bise',
    'bish', 'bisk', 'bist', 'bite', 'bito', 'bits', 'bitt', 'bize', 'blab', 'blad',
    'blae', 'blag', 'blah', 'blam', 'blat', 'blaw', 'blay', 'bleb', 'bled', 'blee',
    'blet', 'blew', 'bley', 'blin', 'blip', 'blit', 'blob', 'bloc', 'blog', 'blot',
    'blow', 'blub', 'blud', 'blue', 'blur', 'boab', 'boak', 'boar', 'boas', 'boat'
    // Truncated for brevity - in production, include full dictionary
];

// Generate a random alphagram from a word
function generateAlphagram(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('').toUpperCase();
}

// Create fake alphagrams that don't form valid words
function generateFakeAlphagram() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let fake;
    do {
        fake = Array.from({length: 4}, () => 
            letters[Math.floor(Math.random() * letters.length)]
        ).join('');
    } while (hasValidWords(fake));
    return fake;
}

// Check if an alphagram can form valid words
function hasValidWords(alphagram) {
    const letters = alphagram.toLowerCase().split('').sort();
    return DICTIONARY.some(word => {
        const wordLetters = word.split('').sort();
        return JSON.stringify(letters) === JSON.stringify(wordLetters);
    });
}

// Get all valid words for an alphagram
function getValidWords(alphagram) {
    const letters = alphagram.toLowerCase().split('').sort();
    return DICTIONARY.filter(word => {
        const wordLetters = word.split('').sort();
        return JSON.stringify(letters) === JSON.stringify(wordLetters);
    });
}

// Generate a complete game set
function generateGameSet() {
    const gameSet = [];
    const usedWords = new Set();
    
    // Generate 15-17 real alphagrams
    const realCount = 15 + Math.floor(Math.random() * 3);
    for (let i = 0; i < realCount; i++) {
        let word;
        do {
            word = DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)];
        } while (usedWords.has(word));
        
        usedWords.add(word);
        const alphagram = generateAlphagram(word);
        const validWords = getValidWords(alphagram);
        
        gameSet.push({
            alphagram,
            isFake: false,
            validWords
        });
    }
    
    // Generate 3-5 fake alphagrams
    const fakeCount = 20 - realCount;
    for (let i = 0; i < fakeCount; i++) {
        gameSet.push({
            alphagram: generateFakeAlphagram(),
            isFake: true,
            validWords: []
        });
    }
    
    // Shuffle the array
    return gameSet.sort(() => Math.random() - 0.5);
}

// Calculate score for an answer
function calculateScore(alphagram, userInput, isFake, validWords) {
    // Handle fake alphagrams
    if (isFake) {
        if (userInput.toLowerCase() === 'x') {
            return { isCorrect: true, score: 10 };
        } else if (userInput.trim() === '') {
            return { isCorrect: false, score: 0 };
        } else {
            return { isCorrect: false, score: -5 };
        }
    }
    
    // Handle real alphagrams
    if (userInput.toLowerCase().trim() === 'x') {
        return { isCorrect: false, score: -5 };
    }

    const userAnswers = userInput
        .toLowerCase()
        .split(/[ ,]+/)
        .filter(answer => answer.trim() !== '');
    
    if (userAnswers.length === 0) {
        return { isCorrect: false, score: 0 };
    }
    
    const uniqueUserAnswers = [...new Set(userAnswers)];
    
    // Check for any incorrect answers
    const hasIncorrectAnswer = uniqueUserAnswers.some(answer => 
        answer !== 'x' && !validWords.includes(answer)
    );
    
    if (hasIncorrectAnswer) {
        return { isCorrect: false, score: -5 };
    }
    
    // Calculate score based on correct answers
    const correctAnswers = uniqueUserAnswers.filter(answer => 
        validWords.includes(answer)
    );
    
    if (correctAnswers.length === validWords.length) {
        return { isCorrect: true, score: 10 };
    } else if (correctAnswers.length > 0) {
        const partialScore = Math.round(10 * (correctAnswers.length / validWords.length));
        return { isCorrect: 'partial', score: partialScore };
    } else {
        return { isCorrect: false, score: 0 };
    }
}

module.exports = {
    generateGameSet,
    calculateScore,
    getValidWords
};
