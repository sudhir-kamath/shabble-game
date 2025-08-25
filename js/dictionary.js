// Dictionary of valid 2-letter words
const DICTIONARY_2 = [
    'aa', 'ab', 'ad', 'ae', 'ag', 'ah', 'ai', 'al', 'am', 'an', 'ar', 'as', 'at', 'aw', 'ax', 'ay',
    'ba', 'be', 'bi', 'bo', 'by', 'ch', 'da', 'de', 'do', 'ed', 'ef', 'eh', 'el', 'em', 'en', 'er',
    'es', 'et', 'ex', 'fa', 'fe', 'gi', 'go', 'ha', 'he', 'hi', 'hm', 'ho', 'id', 'if', 'in', 'is',
    'it', 'jo', 'ka', 'ki', 'la', 'li', 'lo', 'ma', 'me', 'mi', 'mm', 'mo', 'mu', 'my', 'na', 'ne',
    'no', 'nu', 'od', 'oe', 'of', 'oh', 'oi', 'ok', 'om', 'on', 'oo', 'op', 'or', 'os', 'ow', 'ox',
    'oy', 'pa', 'pe', 'pi', 'po', 're', 'sh', 'si', 'so', 'ta', 'ti', 'to', 'uh', 'um', 'un', 'up',
    'us', 'ut', 'we', 'wo', 'xi', 'xu', 'ya', 'ye', 'yo', 'za', 'zo'
];

// Dictionary of valid 3-letter words
const DICTIONARY_3 = [
    'aah', 'aal', 'aas', 'aba', 'abb', 'abo', 'abs', 'aby', 'ace', 'act', 'add', 'ado', 'ads', 'adz',
    'aff', 'aft', 'aga', 'age', 'ago', 'ags', 'aha', 'ahi', 'ahs', 'aid', 'aim', 'ain', 'air', 'ais',
    'ait', 'aka', 'ake', 'ala', 'alb', 'ale', 'all', 'alp', 'als', 'alt', 'ama', 'ami', 'amp', 'amu',
    'ana', 'and', 'ane', 'ani', 'ant', 'any', 'ape', 'apo', 'app', 'apt', 'arb', 'arc', 'ard', 'are',
    'arf', 'ark', 'arm', 'ars', 'art', 'ash', 'ask', 'asp', 'ass', 'ate', 'att', 'auk', 'ava', 'ave',
    'avo', 'awa', 'awe', 'awn', 'axe', 'aye', 'ays', 'ayu', 'baa', 'bad', 'bag', 'bah', 'bal', 'bam',
    'ban', 'bap', 'bar', 'bas', 'bat', 'bay', 'bed', 'bee', 'beg', 'bel', 'ben', 'bes', 'bet', 'bey',
    'bib', 'bid', 'big', 'bin', 'bio', 'bis', 'bit', 'boa', 'bob', 'bod', 'bog', 'boh', 'boo', 'bop',
    'bot', 'bow', 'box', 'boy', 'brr', 'bub', 'bud', 'bug', 'bum', 'bun', 'bur', 'bus', 'but', 'buy',
    'bye', 'cab', 'cad', 'cam', 'can', 'cap', 'car', 'cat', 'caw', 'cay', 'cee', 'chi', 'cig', 'cis',
    'cob', 'cod', 'cog', 'con', 'coo', 'cop', 'cor', 'cos', 'cot', 'cow', 'cox', 'coy', 'coz', 'cru',
    'cry', 'cub', 'cud', 'cue', 'cum', 'cup', 'cur', 'cut', 'cwm', 'dab', 'dad', 'dag', 'dah', 'dak',
    'dam', 'dan', 'dap', 'das', 'daw', 'day', 'deb', 'dee', 'def', 'del', 'den', 'dev', 'dew', 'dex',
    'dey', 'dib', 'did', 'die', 'dig', 'dim', 'din', 'dip', 'dis', 'dit', 'doc', 'doe', 'dog', 'dom',
    'don', 'dor', 'dos', 'dot', 'dow', 'dry', 'dub', 'dud', 'due', 'dug', 'duh', 'dui', 'dun', 'duo',
    'dup', 'dye', 'dzs', 'ear', 'eat', 'eau', 'ebb', 'ecu', 'edh', 'eds', 'eel', 'eff', 'efs', 'eft',
    'egg', 'ego', 'eke', 'eld', 'elf', 'elk', 'ell', 'elm', 'els', 'eme', 'emo', 'ems', 'emu', 'end',
    'eng', 'ens', 'eon', 'era', 'ere', 'erg', 'ern', 'err', 'eta', 'eth', 'eve', 'ewe', 'eye', 'fab',
    'fad', 'fag', 'fan', 'far', 'fas', 'fat', 'fax', 'fay', 'fed', 'fee', 'fem', 'fen', 'fer', 'fet',
    'few', 'fey', 'fez', 'fib', 'fid', 'fie', 'fig', 'fil', 'fin', 'fir', 'fit', 'fix', 'flu', 'fly',
    'fob', 'foe', 'fog', 'foh', 'fon', 'foo', 'fop', 'for', 'fou', 'fox', 'foy', 'fro', 'fry', 'fub',
    'fud', 'fug', 'fun', 'fur', 'gab', 'gad', 'gae', 'gag', 'gal', 'gam', 'gan', 'gap', 'gar', 'gas',
    'gat', 'gau', 'gay', 'ged', 'gee', 'gel', 'gem', 'gen', 'get', 'gey', 'ghi', 'gib', 'gid', 'gie',
    'gig', 'gin', 'gip', 'git', 'gnu', 'goa', 'gob', 'god', 'goo', 'gor', 'gos', 'got', 'gox', 'goy',
    'gul', 'gum', 'gun', 'gup', 'gur', 'gus', 'gut', 'guv', 'guy', 'gym', 'gyp', 'had', 'hae', 'hag',
    'hah', 'haj', 'ham', 'hao', 'hap', 'has', 'hat', 'haw', 'hay', 'heh', 'hem', 'hen', 'hep', 'her',
    'hes', 'het', 'hew', 'hex', 'hey', 'hic', 'hid', 'hie', 'him', 'hin', 'hip', 'his', 'hit', 'hmm',
    'hob', 'hod', 'hoe', 'hog', 'hom', 'hon', 'hoo', 'hop', 'hos', 'hot', 'how', 'hoy', 'hub', 'hue',
    'hug', 'huh', 'hum', 'hun', 'hup', 'hut', 'hyp', 'ice', 'ich', 'ick', 'icy', 'ids', 'iff', 'ifs',
    'ilk', 'ill', 'imp', 'ink', 'inn', 'ins', 'ion', 'ire', 'irk', 'ism', 'its', 'ivy', 'jab', 'jag',
    'jam', 'jar', 'jaw', 'jay', 'jee', 'jet', 'jeu', 'jew', 'jib', 'jig', 'jin', 'job', 'joe', 'jog',
    'jot', 'jow', 'joy', 'jug', 'jun', 'jus', 'jut', 'kab', 'kae', 'kaf', 'kas', 'kat', 'kaw', 'kay',
    'kea', 'kef', 'keg', 'ken', 'kep', 'ket', 'kex', 'key', 'khi', 'kid', 'kif', 'kin', 'kip', 'kir',
    'kis', 'kit', 'koa', 'kob', 'koi', 'kop', 'kor', 'kos', 'kue', 'kye', 'lab', 'lac', 'lad', 'lag',
    'lah', 'lam', 'lap', 'lar', 'las', 'lat', 'lav', 'law', 'lax', 'lay', 'lea', 'led', 'lee', 'leg',
    'lei', 'lek', 'les', 'let', 'leu', 'lev', 'lew', 'lex', 'ley', 'lez', 'lib', 'lid', 'lie', 'lin',
    'lip', 'lis', 'lit', 'lob', 'log', 'loo', 'lop', 'lot', 'low', 'lox', 'lud', 'lug', 'luv', 'lux',
    'luz', 'lye', 'mac', 'mad', 'mae', 'mag', 'man', 'map', 'mar', 'mas', 'mat', 'maw', 'max', 'may',
    'med', 'meg', 'mel', 'mem', 'men', 'met', 'mew', 'mho', 'mib', 'mic', 'mid', 'mig', 'mil', 'mim',
    'mir', 'mis', 'mix', 'miz', 'moa', 'mob', 'mod', 'mog', 'mom', 'mon', 'moo', 'mop', 'mor', 'mos',
    'mot', 'mow', 'mud', 'mug', 'mum', 'mun', 'mus', 'mut', 'mux', 'myc', 'nab', 'nae', 'nag', 'nah',
    'nam', 'nan', 'nap', 'naw', 'nay', 'neb', 'nee', 'neg', 'net', 'new', 'nib', 'nil', 'nim', 'nip',
    'nit', 'nix', 'nob', 'nod', 'nog', 'noh', 'nom', 'noo', 'nor', 'nos', 'not', 'now', 'nth', 'nub',
    'nun', 'nut', 'oaf', 'oak', 'oar', 'oat', 'oba', 'obe', 'obi', 'oca', 'och', 'odd', 'ode', 'ods',
    'oes', 'off', 'oft', 'ohm', 'oho', 'ohs', 'oik', 'oil', 'oka', 'oke', 'old', 'ole', 'oms', 'one',
    'ons', 'ooh', 'oom', 'oon', 'oop', 'oor', 'oos', 'oot', 'ope', 'ops', 'opt', 'orb', 'orc', 'ore',
    'orf', 'ors', 'ort', 'ose', 'oud', 'our', 'out', 'ova', 'owe', 'owl', 'own', 'owt', 'oxo', 'oxy',
    'oye', 'oys', 'pac', 'pad', 'pah', 'pal', 'pam', 'pan', 'pap', 'par', 'pas', 'pat', 'pav', 'paw',
    'pax', 'pay', 'pea', 'pec', 'ped', 'pee', 'peg', 'pen', 'pep', 'per', 'pes', 'pet', 'pew', 'phi',
    'pho', 'pic', 'pie', 'pig', 'pin', 'pip', 'pis', 'pit', 'piu', 'pix', 'ply', 'poa', 'pod', 'poh',
    'poi', 'pol', 'pom', 'poo', 'pop', 'pos', 'pot', 'pow', 'pox', 'poz', 'pro', 'pry', 'psi', 'pst',
    'pub', 'pud', 'pug', 'pul', 'pun', 'pup', 'pur', 'pus', 'put', 'puy', 'pya', 'pye', 'pyx', 'qat',
    'qis', 'qua', 'rad', 'rag', 'rah', 'rai', 'raj', 'ram', 'ran', 'rap', 'ras', 'rat', 'raw', 'rax',
    'ray', 'reb', 'rec', 'red', 'ref', 'reg', 'rei', 'rem', 'rep', 'res', 'ret', 'rev', 'rex', 'rho',
    'rib', 'rid', 'rif', 'rig', 'rim', 'rin', 'rip', 'rit', 'rob', 'roc', 'rod', 'roe', 'rom', 'rot',
    'row', 'rub', 'rue', 'rug', 'rum', 'run', 'rut', 'rya', 'rye', 'sab', 'sac', 'sad', 'sae', 'sag',
    'sal', 'sap', 'sar', 'sat', 'sau', 'saw', 'sax', 'say', 'sea', 'sed', 'see', 'seg', 'sei', 'sel',
    'sen', 'ser', 'set', 'sew', 'sex', 'sha', 'she', 'shh', 'shy', 'sib', 'sic', 'sim', 'sin', 'sip',
    'sir', 'sis', 'sit', 'six', 'ska', 'ski', 'sky', 'sly', 'sob', 'sod', 'soh', 'sol', 'som', 'son',
    'sop', 'sos', 'sot', 'sou', 'sow', 'sox', 'soy', 'spa', 'spy', 'sty', 'sub', 'sud', 'sue', 'suk',
    'sum', 'sun', 'sup', 'suq', 'syn', 'tab', 'tad', 'tae', 'tag', 'taj', 'tak', 'tam', 'tan', 'tao',
    'tap', 'tar', 'tas', 'tat', 'tau', 'tav', 'taw', 'tax', 'tea', 'ted', 'tee', 'teg', 'tel', 'ten',
    'tes', 'tet', 'tew', 'the', 'tho', 'thy', 'tic', 'tid', 'tie', 'tig', 'tik', 'til', 'tin', 'tip',
    'tis', 'tit', 'tix', 'tiz', 'tod', 'toe', 'tog', 'tom', 'ton', 'too', 'top', 'tor', 'tot', 'tow',
    'toy', 'try', 'tsk', 'tub', 'tug', 'tui', 'tum', 'tun', 'tup', 'tut', 'tux', 'twa', 'two', 'tye',
    'udo', 'uds', 'ugh', 'ugs', 'uke', 'ule', 'ulu', 'uma', 'umm', 'ump', 'ums', 'una', 'uns', 'upo',
    'ups', 'urb', 'urd', 'urn', 'urp', 'use', 'uta', 'ute', 'uts', 'vac', 'van', 'var', 'vas', 'vat',
    'vau', 'vav', 'vaw', 'vee', 'veg', 'vet', 'vex', 'via', 'vib', 'vid', 'vie', 'vig', 'vim', 'vis',
    'voe', 'von', 'vow', 'vox', 'vug', 'vum', 'wab', 'wad', 'wae', 'wag', 'wan', 'wap', 'war', 'was',
    'wat', 'waw', 'wax', 'way', 'web', 'wed', 'wee', 'wen', 'wet', 'wey', 'wha', 'who', 'why', 'wig',
    'win', 'wis', 'wit', 'wiz', 'woe', 'wog', 'wok', 'won', 'woo', 'wop', 'wos', 'wot', 'wow', 'wry',
    'wud', 'wye', 'wyn', 'xis', 'yag', 'yah', 'yak', 'yam', 'yap', 'yar', 'yas', 'yat', 'yaw', 'yay',
    'yea', 'yeh', 'yen', 'yep', 'yer', 'yes', 'yet', 'yew', 'yex', 'yid', 'yin', 'yip', 'yob', 'yod',
    'yon', 'you', 'yow', 'yuk', 'yum', 'yup', 'yus', 'zag', 'zap', 'zas', 'zax', 'zea', 'zed', 'zee',
    'zek', 'zen', 'zep', 'zet', 'zho', 'zig', 'zin', 'zip', 'zit', 'ziz', 'zoa', 'zol', 'zoo', 'zos',
    'zuz', 'zzz'
];

// Dictionary of valid 4-letter words
const DICTIONARY_4 = [
    'aahs',     'aals',     'abac',     'abas',     'abba',     'abbe',     'abbs',     'abed',     'aber',     'abet',
    'abid',     'able',     'ably',     'abri',     'abut',     'abye',     'abys',     'acai',     'acca',     'aced',
    'acer',     'aces',     'ache',     'achy',     'acid',     'acme',     'acne',     'acre',     'acro',     'acta',
    'acts',     'acyl',     'adaw',     'adds',     'addy',     'adit',     'ados',     'adry',     'adze',     'aeon',
    'aero',     'aery',     'aesc',     'afar',     'affy',     'afro',     'agar',     'agas',     'aged',     'agee',
    'agen',     'ager',     'ages',     'aggy',     'agha',     'agin',     'agio',     'aglu',     'agly',     'agma',
    'agog',     'agon',     'agro',     'ague',     'ahed',     'ahem',     'ahis',     'ahoy',     'aias',     'aida',
    'aide',     'aids',     'aiga',     'ails',     'aims',     'aine',     'ains',     'airn',     'airs',     'airt',
    'airy',     'aits',     'aitu',     'ajar',     'ajee',     'ajis',     'akas',     'aked',     'akee',     'akes',
    'akin',     'alae',     'alan',     'alap',     'alar',     'alas',     'alay',     'alba',     'albe',     'albs',
    'alco',     'alec',     'alee',     'alef',     'ales',     'alew',     'alfa',     'alga',     'algo',     'alif',
    'alit',     'alko',     'alky',     'alls',     'ally',     'alma',     'alme',     'alms',     'alod',     'aloe',
    'aloo',     'alow',     'alps',     'also',     'alto',     'alts',     'alum',     'alus',     'amah',     'amas',
    'ambo',     'amen',     'ames',     'amia',     'amid',     'amie',     'amin',     'amir',     'amis',     'amla',
    'ammo',     'amok',     'amps',     'amus',     'amyl',     'anal',     'anan',     'anas',     'ance',     'ands',
    'anes',     'anew',     'anga',     'anil',     'anis',     'ankh',     'anna',     'anno',     'anns',     'anoa',
    'anon',     'anow',     'ansa',     'anta',     'ante',     'anti',     'ants',     'anus',     'apay',     'aped',
    'aper',     'apes',     'apex',     'apod',     'apos',     'apps',     'apse',     'apso',     'apts',     'aqua',
    'arak',     'arar',     'arba',     'arbs',     'arch',     'arco',     'arcs',     'ards',     'area',     'ared',
    'areg',     'ares',     'aret',     'arew',     'arfs',     'argh',     'aria',     'arid',     'arie',     'aril',
    'aris',     'arks',     'arle',     'arms',     'army',     'arna',     'aros',     'arow',     'arpa',     'arse',
    'arsy',     'arti',     'arts',     'arty',     'arum',     'arvo',     'aryl',     'asar',     'asci',     'asea',
    'ashy',     'asks',     'asps',     'atap',     'ates',     'atma',     'atoc',     'atok',     'atom',     'atop',
    'atua',     'auas',     'aufs',     'augh',     'auks',     'aula',     'auld',     'aune',     'aunt',     'aura',
    'auto',     'aval',     'avas',     'avel',     'aver',     'aves',     'avid',     'avis',     'avos',     'avow',
    'away',     'awdl',     'awed',     'awee',     'awes',     'awfy',     'awks',     'awls',     'awns',     'awny',
    'awol',     'awry',     'axal',     'axed',     'axel',     'axes',     'axil',     'axis',     'axle',     'axon',
    'ayah',     'ayes',     'ayin',     'ayre',     'ayus',     'azan',     'azon',     'azym',     'baal',     'baas',
    'baba',     'babe',     'babu',     'baby',     'bach',     'back',     'bacs',     'bade',     'bads',     'bael',
    'baes',     'baff',     'baft',     'bagh',     'bags',     'baht',     'bahu',     'bail',     'bait',     'baju',
    'bake',     'bald',     'bale',     'balk',     'ball',     'balm',     'bals',     'balu',     'bams',     'banc',
    'band',     'bane',     'bang',     'bani',     'bank',     'bans',     'bant',     'baos',     'baps',     'bapu',
    'barb',     'bard',     'bare',     'barf',     'bark',     'barm',     'barn',     'barp',     'bars',     'basa',
    'base',     'bash',     'bask',     'bass',     'bast',     'bate',     'bath',     'bats',     'batt',     'baud',
    'bauk',     'baur',     'bawd',     'bawk',     'bawl',     'bawn',     'bawr',     'baws',     'baye',     'bays',
    'bayt',     'bazz',     'bead',     'beak',     'beal',     'beam',     'bean',     'bear',     'beat',     'beau',
    'beck',     'bede',     'beds',     'bedu',     'beef',     'been',     'beep',     'beer',     'bees',     'beet',
    'bego',     'begs',     'bein',     'bell',     'bels',     'belt',     'bema',     'bend',     'bene',     'beni',
    'benj',     'bens',     'bent',     'bere',     'berg',     'berk',     'berm',     'best',     'beta',     'bete',
    'beth',     'bets',     'bevy',     'beys',     'bhai',     'bhat',     'bhel',     'bhut',     'bias',     'bibb',
    'bibe',     'bibs',     'bice',     'bide',     'bidi',     'bids',     'bien',     'bier',     'biff',     'biga',
    'bigg',     'bigs',     'bike',     'bile',     'bilk',     'bill',     'bima',     'bind',     'bine',     'bing',
    'bink',     'bins',     'biog',     'bios',     'bird',     'birk',     'birl',     'biro',     'birr',     'bise',
    'bish',     'bisk',     'bist',     'bite',     'bito',     'bits',     'bitt',     'bize',     'blab',     'blad',
    'blae',     'blag',     'blah',     'blam',     'blat',     'blaw',     'blay',     'bleb',     'bled',     'blee',
    'blet',     'blew',     'bley',     'blin',     'blip',     'blit',     'blob',     'bloc',     'blog',     'blot',
    'blow',     'blub',     'blud',     'blue',     'blur',     'boab',     'boak',     'boar',     'boas',     'boat',
    'boba',     'bobo',     'bobs',     'bock',     'bode',     'bods',     'body',     'boep',     'boet',     'boff',
    'bogs',     'bogy',     'boho',     'bohs',     'boil',     'bois',     'boke',     'boko',     'boks',     'bola',
    'bold',     'bole',     'boll',     'bolo',     'bolt',     'boma',     'bomb',     'bona',     'bond',     'bone',
    'bong',     'bonk',     'bony',     'boob',     'booh',     'book',     'bool',     'boom',     'boon',     'boor',
    'boos',     'boot',     'bopo',     'bops',     'bora',     'bord',     'bore',     'bork',     'borm',     'born',
    'bors',     'bort',     'bosh',     'bosk',     'boss',     'bota',     'bote',     'both',     'bots',     'bott',
    'bouk',     'boun',     'bout',     'bowl',     'bowr',     'bows',     'boxy',     'boyf',     'boyg',     'boyo',
    'boys',     'bozo',     'brad',     'brae',     'brag',     'brak',     'bran',     'brap',     'bras',     'brat',
    'braw',     'bray',     'bred',     'bree',     'brei',     'bren',     'brer',     'brew',     'brey',     'brie',
    'brig',     'brik',     'brim',     'brin',     'brio',     'bris',     'brit',     'brod',     'brog',     'broo',
    'bros',     'brow',     'brrr',     'bruh',     'brus',     'brut',     'bruv',     'brux',     'buat',     'buba',
    'bubo',     'bubs',     'bubu',     'buck',     'buda',     'budi',     'budo',     'buds',     'buff',     'bufo',
    'bugs',     'buhl',     'buhr',     'buik',     'bujo',     'buke',     'bulb',     'bulk',     'bull',     'bumf',
    'bump',     'bums',     'buna',     'bund',     'bung',     'bunk',     'bunn',     'buns',     'bunt',     'buoy',
    'bura',     'burb',     'burd',     'burg',     'burk',     'burl',     'burn',     'burp',     'burr',     'burs',
    'bury',     'bush',     'busk',     'buss',     'bust',     'busy',     'bute',     'buts',     'butt',     'buys',
    'buzz',     'byde',     'byes',     'byke',     'byre',     'byrl',     'byte',     'caas',     'caba',     'cabs',
    'caca',     'cack',     'cade',     'cadi',     'cads',     'cafe',     'caff',     'cafs',     'cage',     'cags',
    'cagy',     'caid',     'cain',     'cake',     'caky',     'calf',     'calk',     'call',     'calm',     'calo',
    'calp',     'cals',     'calx',     'cama',     'came',     'cami',     'camo',     'camp',     'cams',     'cane',
    'cang',     'cann',     'cans',     'cant',     'cany',     'capa',     'cape',     'caph',     'capi',     'capo',
    'caps',     'carb',     'card',     'care',     'cark',     'carl',     'carn',     'carp',     'carr',     'cars',
    'cart',     'casa',     'case',     'cash',     'cask',     'cast',     'cate',     'cath',     'cats',     'cauf',
    'cauk',     'caul',     'caum',     'caup',     'cava',     'cave',     'cavy',     'cawk',     'caws',     'cays',
    'cazh',     'ceas',     'ceca',     'cede',     'cedi',     'cees',     'ceil',     'cell',     'cels',     'celt',
    'cens',     'cent',     'cepe',     'ceps',     'cere',     'cero',     'cert',     'cess',     'cete',     'chad',
    'chai',     'chal',     'cham',     'chao',     'chap',     'char',     'chas',     'chat',     'chav',     'chaw',
    'chay',     'chef',     'chem',     'cher',     'chew',     'chez',     'chia',     'chib',     'chic',     'chid',
    'chik',     'chin',     'chip',     'chis',     'chit',     'chiv',     'chiz',     'choc',     'chog',     'chon',
    'chop',     'chou',     'chow',     'chub',     'chug',     'chum',     'chur',     'chut',     'ciao',     'cide',
    'cids',     'ciel',     'cigs',     'cill',     'cine',     'cinq',     'cion',     'cire',     'cirl',     'cist',
    'cite',     'cito',     'cits',     'city',     'cive',     'clad',     'clag',     'clam',     'clan',     'clap',
    'clat',     'claw',     'clay',     'clef',     'cleg',     'clem',     'clew',     'clip',     'clit',     'clod',
    'clog',     'clon',     'clop',     'clot',     'clou',     'clow',     'cloy',     'club',     'clue',     'coal',
    'coat',     'coax',     'cobb',     'cobs',     'coca',     'coch',     'cock',     'coco',     'coda',     'code',
    'cods',     'coed',     'coff',     'coft',     'cogs',     'coho',     'coif',     'coil',     'coin',     'coir',
    'coit',     'coke',     'coky',     'cola',     'cold',     'cole',     'coll',     'cols',     'colt',     'coly',
    'coma',     'comb',     'come',     'comm',     'comp',     'coms',     'cond',     'cone',     'conf',     'coni',
    'conk',     'conn',     'cons',     'cony',     'coof',     'cook',     'cool',     'coom',     'coon',     'coop',
    'coos',     'coot',     'cope',     'copi',     'cops',     'copy',     'cord',     'core',     'corf',     'cork',
    'corm',     'corn',     'cors',     'cory',     'cose',     'cosh',     'coss',     'cost',     'cosy',     'cote',
    'coth',     'cots',     'cott',     'coup',     'cour',     'cove',     'cowk',     'cowl',     'cowp',     'cows',
    'cowy',     'coxa',     'coxy',     'coys',     'coze',     'cozy',     'crab',     'crag',     'cram',     'cran',
    'crap',     'craw',     'cray',     'cred',     'cree',     'crem',     'crew',     'cria',     'crib',     'crim',
    'cris',     'crit',     'croc',     'crog',     'cron',     'crop',     'crow',     'crud',     'crue',     'crus',
    'crux',     'cube',     'cubs',     'cuck',     'cuds',     'cued',     'cues',     'cuff',     'cuif',     'cuit',
    'cuke',     'cull',     'culm',     'cult',     'cums',     'cunt',     'cups',     'curb',     'curd',     'cure',
    'curf',     'curl',     'curn',     'curr',     'curs',     'curt',     'cush',     'cusk',     'cusp',     'cuss',
    'cute',     'cuts',     'cwms',     'cyan',     'cyma',     'cyme',     'cyst',     'cyte',     'czar',     'daal',
    'dabs',     'dace',     'dack',     'dada',     'dado',     'dads',     'daes',     'daff',     'daft',     'dags',
    'dahl',     'dahs',     'dais',     'daks',     'dale',     'dali',     'dals',     'dalt',     'dame',     'damn',
    'damp',     'dams',     'dang',     'dank',     'dans',     'dant',     'daps',     'darb',     'dare',     'darg',
    'dari',     'dark',     'darn',     'dart',     'dash',     'data',     'date',     'dato',     'daub',     'daud',
    'daur',     'daut',     'davy',     'dawd',     'dawk',     'dawn',     'daws',     'dawt',     'days',     'daze',
    'dead',     'deaf',     'deal',     'dean',     'dear',     'deaw',     'debe',     'debs',     'debt',     'deck',
    'deco',     'deed',     'deek',     'deem',     'deen',     'deep',     'deer',     'dees',     'deet',     'deev',
    'defi',     'defo',     'deft',     'defy',     'degs',     'degu',     'deid',     'deif',     'deil',     'deke',
    'dele',     'delf',     'deli',     'dell',     'delo',     'dels',     'delt',     'deme',     'demo',     'demy',
    'dene',     'deni',     'dens',     'dent',     'deny',     'deps',     'dere',     'derm',     'dern',     'dero',
    'derp',     'derv',     'desi',     'desk',     'deus',     'deva',     'devi',     'devo',     'devs',     'dews',
    'dewy',     'dexy',     'deys',     'dhak',     'dhal',     'dhol',     'dhow',     'dial',     'dibs',     'dice',
    'dich',     'dick',     'dict',     'dido',     'didy',     'dieb',     'died',     'diel',     'dies',     'diet',
    'diff',     'difs',     'digs',     'dika',     'dike',     'dill',     'dime',     'dimp',     'dims',     'dine',
    'ding',     'dink',     'dino',     'dins',     'dint',     'diol',     'dips',     'dipt',     'dire',     'dirk',
    'dirl',     'dirt',     'disa',     'disc',     'dish',     'disk',     'diss',     'dita',     'dite',     'dits',
    'ditt',     'ditz',     'diva',     'dive',     'divi',     'divo',     'divs',     'dixi',     'dixy',     'diya',
    'djin',     'doab',     'doat',     'dobe',     'dobs',     'doby',     'dock',     'doco',     'docs',     'docu',
    'dodo',     'dods',     'doek',     'doen',     'doer',     'does',     'doff',     'doge',     'dogs',     'dogy',
    'dohs',     'doit',     'dojo',     'dole',     'doll',     'dols',     'dolt',     'dome',     'doms',     'domy',
    'dona',     'done',     'dong',     'dons',     'doob',     'dook',     'dool',     'doom',     'doon',     'door',
    'doos',     'dopa',     'dope',     'dops',     'dopy',     'dorb',     'dore',     'dork',     'dorm',     'dorp',
    'dorr',     'dors',     'dort',     'dory',     'dosa',     'dose',     'dosh',     'doss',     'dost',     'dote',
    'doth',     'dots',     'doty',     'douc',     'douk',     'doum',     'doun',     'doup',     'dour',     'dout',
    'doux',     'dove',     'dowd',     'dowf',     'dowl',     'down',     'dowp',     'dows',     'dowt',     'doxx',
    'doxy',     'doys',     'doze',     'dozy',     'drab',     'drac',     'drad',     'drag',     'dram',     'drap',
    'drat',     'draw',     'dray',     'dree',     'dreg',     'drek',     'drew',     'drey',     'drib',     'drip',
    'drop',     'drow',     'drub',     'drug',     'drum',     'drys',     'dsos',     'duad',     'dual',     'duan',
    'duar',     'dubs',     'duce',     'duci',     'duck',     'duct',     'dude',     'duds',     'dued',     'duel',
    'dues',     'duet',     'duff',     'dugs',     'duit',     'duka',     'duke',     'dule',     'dull',     'duly',
    'duma',     'dumb',     'dump',     'dune',     'dung',     'dunk',     'duns',     'dunt',     'duos',     'dupe',
    'dups',     'dura',     'dure',     'durn',     'duro',     'durr',     'dush',     'dusk',     'dust',     'duty',
    'dwam',     'dyad',     'dyed',     'dyer',     'dyes',     'dyke',     'dyne',     'dzho',     'dzos',     'each',
    'eale',     'eans',     'eard',     'earl',     'earn',     'ears',     'ease',     'east',     'easy',     'eath',
    'eats',     'eaus',     'eaux',     'eave',     'ebbs',     'ebon',     'ecad',     'ecce',     'ecco',     'eche',
    'echo',     'echt',     'ecod',     'ecos',     'ecru',     'ecus',     'eddo',     'eddy',     'edge',     'edgy',
    'edhs',     'edit',     'eech',     'eeew',     'eels',     'eely',     'eery',     'eevn',     'effs',     'efts',
    'egad',     'egal',     'eger',     'eggs',     'eggy',     'egis',     'egma',     'egos',     'ehed',     'eide',
    'eiks',     'eild',     'eina',     'eine',     'eish',     'eked',     'ekes',     'ekka',     'elan',     'elds',
    'elfs',     'elhi',     'elks',     'ells',     'elms',     'elmy',     'else',     'elts',     'emes',     'emeu',
    'emic',     'emir',     'emit',     'emma',     'emmy',     'emos',     'empt',     'emus',     'emyd',     'emys',
    'ends',     'enes',     'enew',     'engs',     'enol',     'enow',     'ents',     'enuf',     'envy',     'eoan',
    'eons',     'eorl',     'epee',     'epha',     'epic',     'epos',     'eras',     'ered',     'eres',     'erev',
    'ergo',     'ergs',     'erhu',     'eric',     'erks',     'erne',     'erns',     'eros',     'errs',     'erst',
    'eruv',     'eses',     'esky',     'esne',     'espy',     'esse',     'ests',     'etas',     'etat',     'etch',
    'eten',     'ethe',     'eths',     'etic',     'etna',     'etui',     'euge',     'eugh',     'euks',     'euoi',
    'euro',     'even',     'ever',     'eves',     'evet',     'evil',     'evoe',     'evos',     'ewer',     'ewes',
    'ewks',     'ewts',     'exam',     'exec',     'exed',     'exes',     'exit',     'exon',     'expo',     'exul',
    'eyas',     'eyed',     'eyen',     'eyer',     'eyes',     'eyne',     'eyot',     'eyra',     'eyre',     'eyry',
    'faan',     'faas',     'fabs',     'face',     'fact',     'fade',     'fado',     'fads',     'fady',     'faff',
    'fags',     'fahs',     'faik',     'fail',     'fain',     'fair',     'faix',     'fake',     'fall',     'falx',
    'fame',     'fams',     'fand',     'fane',     'fang',     'fank',     'fano',     'fans',     'faps',     'fard',
    'fare',     'farl',     'farm',     'faro',     'fars',     'fart',     'fash',     'fast',     'fate',     'fats',
    'faun',     'faur',     'faut',     'faux',     'fava',     'fave',     'favs',     'fawn',     'faws',     'fays',
    'faze',     'feal',     'fear',     'feat',     'feck',     'feds',     'feeb',     'feed',     'feel',     'feen',
    'feer',     'fees',     'feet',     'fegs',     'fehm',     'fehs',     'feis',     'fell',     'felt',     'feme',
    'fems',     'fend',     'feni',     'fens',     'fent',     'feod',     'fere',     'ferm',     'fern',     'fess',
    'fest',     'feta',     'fete',     'fets',     'fett',     'feud',     'feus',     'fews',     'feys',     'fiar',
    'fiat',     'fibs',     'fice',     'fico',     'fido',     'fids',     'fief',     'fier',     'fife',     'fifi',
    'figo',     'figs',     'fike',     'fiky',     'fila',     'file',     'filk',     'fill',     'film',     'filo',
    'fils',     'find',     'fine',     'fini',     'fink',     'fino',     'fins',     'fiqh',     'fire',     'firk',
    'firm',     'firn',     'firs',     'fisc',     'fish',     'fisk',     'fist',     'fits',     'fitt',     'five',
    'fixt',     'fizz',     'flab',     'flag',     'flak',     'flam',     'flan',     'flap',     'flat',     'flaw',
    'flax',     'flay',     'flea',     'fled',     'flee',     'fleg',     'flew',     'flex',     'fley',     'flic',
    'flim',     'flip',     'flir',     'flit',     'flix',     'flob',     'floc',     'floe',     'flog',     'flop',
    'flor',     'flow',     'flox',     'flub',     'flue',     'flus',     'flux',     'foal',     'foam',     'fobs',
    'foci',     'foen',     'foes',     'fogs',     'fogy',     'fohn',     'foid',     'foil',     'foin',     'fold',
    'folk',     'folx',     'fond',     'fone',     'fons',     'font',     'food',     'fool',     'foos',     'foot',
    'fops',     'fora',     'forb',     'ford',     'fore',     'fork',     'form',     'fort',     'foss',     'foud',
    'foul',     'four',     'fous',     'fowl',     'foxy',     'foys',     'fozy',     'frab',     'frae',     'frag',
    'frap',     'fras',     'frat',     'frau',     'fray',     'free',     'fret',     'frib',     'frig',     'fris',
    'frit',     'friz',     'froe',     'frog',     'from',     'fros',     'frow',     'frug',     'fubs',     'fuci',
    'fuck',     'fuds',     'fuel',     'fuff',     'fugs',     'fugu',     'fuji',     'full',     'fume',     'fums',
    'fumy',     'fund',     'fung',     'funk',     'funs',     'furl',     'furr',     'furs',     'fury',     'fusc',
    'fuse',     'fusk',     'fuss',     'fust',     'futz',     'fuze',     'fuzz',     'fyce',     'fyke',     'fyle',
    'fyrd',     'gabs',     'gaby',     'gach',     'gade',     'gadi',     'gads',     'gaed',     'gaen',     'gaes',
    'gaff',     'gaga',     'gage',     'gags',     'gaid',     'gain',     'gair',     'gait',     'gajo',     'gaks',
    'gala',     'gale',     'gall',     'gals',     'gama',     'gamb',     'game',     'gamp',     'gams',     'gamy',
    'gane',     'gang',     'gank',     'gans',     'gant',     'gaol',     'gape',     'gapo',     'gaps',     'gapy',
    'garb',     'gare',     'gari',     'gars',     'gart',     'gash',     'gasp',     'gast',     'gate',     'gath',
    'gats',     'gaud',     'gaum',     'gaun',     'gaup',     'gaur',     'gaus',     'gave',     'gawd',     'gawk',
    'gawp',     'gaws',     'gays',     'gaze',     'gazy',     'geal',     'gean',     'gear',     'geat',     'geck',
    'geds',     'geed',     'geek',     'geep',     'gees',     'geez',     'geit',     'geld',     'gels',     'gelt',
    'gems',     'gena',     'gene',     'gens',     'gent',     'genu',     'geos',     'gere',     'germ',     'gers',
    'gert',     'gest',     'geta',     'gets',     'geum',     'ghat',     'ghee',     'ghis',     'gibe',     'gibs',
    'gids',     'gied',     'gien',     'gies',     'gifs',     'gift',     'giga',     'gigs',     'gila',     'gild',
    'gill',     'gilt',     'gimp',     'ging',     'gink',     'ginn',     'gins',     'gios',     'gips',     'gird',
    'girl',     'girn',     'giro',     'girr',     'girt',     'gism',     'gist',     'gite',     'gits',     'give',
    'gizz',     'gjus',     'glad',     'glam',     'gled',     'glee',     'gleg',     'glei',     'glen',     'gley',
    'glia',     'glib',     'glid',     'glim',     'glit',     'glob',     'glom',     'glop',     'glow',     'glue',
    'glug',     'glum',     'glut',     'gnar',     'gnat',     'gnaw',     'gnow',     'gnus',     'goad',     'goaf',
    'goal',     'goas',     'goat',     'gobi',     'gobo',     'gobs',     'goby',     'gods',     'goel',     'goer',
    'goes',     'goey',     'goff',     'gogo',     'goji',     'gold',     'gole',     'golf',     'golp',     'gone',
    'gong',     'gonk',     'gons',     'good',     'goof',     'goog',     'gook',     'gool',     'goon',     'goop',
    'goor',     'goos',     'gora',     'gore',     'gori',     'gorm',     'gorp',     'gors',     'gory',     'gosh',
    'goss',     'goth',     'gouk',     'gout',     'govs',     'gowd',     'gowf',     'gowk',     'gowl',     'gown',
    'grab',     'grad',     'gram',     'gran',     'grat',     'grav',     'gray',     'gree',     'gren',     'grew',
    'grex',     'grey',     'grid',     'grig',     'grim',     'grin',     'grip',     'gris',     'grit',     'griz',
    'grog',     'grok',     'grot',     'grow',     'grrl',     'grub',     'grue',     'grum',     'guac',     'guan',
    'guar',     'gubs',     'guck',     'gude',     'gues',     'guff',     'guga',     'guid',     'gula',     'gule',
    'gulf',     'gull',     'gulp',     'guls',     'guly',     'gump',     'gums',     'gung',     'gunk',     'guns',
    'gups',     'gurl',     'gurn',     'gurs',     'guru',     'gush',     'gust',     'guts',     'guvs',     'guys',
    'gyal',     'gyan',     'gybe',     'gymp',     'gyms',     'gyno',     'gyny',     'gypo',     'gyps',     'gyre',
    'gyri',     'gyro',     'gyte',     'gyve',     'haaf',     'haar',     'habu',     'hack',     'hade',     'hadj',
    'hads',     'haed',     'haem',     'haen',     'haes',     'haet',     'haff',     'haft',     'hagg',     'hags',
    'haha',     'hahs',     'haik',     'hail',     'hain',     'hair',     'haji',     'hajj',     'haka',     'hake',
    'haku',     'hale',     'half',     'hall',     'halm',     'halo',     'halt',     'hame',     'hams',     'hand',
    'hang',     'hank',     'hant',     'haos',     'haps',     'hapu',     'hard',     'hare',     'hark',     'harl',
    'harm',     'harn',     'haro',     'harp',     'hart',     'hash',     'hask',     'hasp',     'hass',     'hast',
    'hate',     'hath',     'hats',     'haud',     'hauf',     'haul',     'haun',     'haut',     'have',     'hawk',
    'hawm',     'haws',     'hays',     'haze',     'hazy',     'head',     'heal',     'heap',     'hear',     'heat',
    'hebe',     'hech',     'heck',     'heed',     'heel',     'heft',     'hehs',     'heid',     'heil',     'heir',
    'held',     'hele',     'hell',     'helm',     'helo',     'help',     'heme',     'hemp',     'hems',     'hend',
    'hens',     'hent',     'heps',     'hept',     'herb',     'herd',     'here',     'herl',     'herm',     'hern',
    'hero',     'hers',     'hery',     'hesp',     'hest',     'hete',     'heth',     'hets',     'hewn',     'hews',
    'heys',     'hick',     'hide',     'hied',     'hies',     'high',     'hike',     'hila',     'hild',     'hili',
    'hill',     'hilt',     'hims',     'hind',     'hing',     'hins',     'hint',     'hioi',     'hips',     'hipt',
    'hire',     'hish',     'hisn',     'hiss',     'hist',     'hits',     'hive',     'hiya',     'hizz',     'hmmm',
    'hoar',     'hoas',     'hoax',     'hobo',     'hobs',     'hock',     'hods',     'hoed',     'hoer',     'hoes',
    'hogg',     'hogh',     'hogs',     'hoha',     'hohs',     'hoik',     'hois',     'hoka',     'hoke',     'hoki',
    'hold',     'hole',     'holk',     'holm',     'holo',     'holp',     'hols',     'holt',     'holy',     'homa',
    'home',     'homo',     'homs',     'homy',     'hond',     'hone',     'hong',     'honk',     'hons',     'hood',
    'hoof',     'hook',     'hoon',     'hoop',     'hoor',     'hoot',     'hope',     'hops',     'hora',     'hore',
    'hork',     'horn',     'hors',     'hose',     'hoss',     'host',     'hote',     'hots',     'houf',     'hour',
    'hout',     'hove',     'howe',     'howf',     'howk',     'howl',     'hows',     'hoya',     'hoys',     'hubs',
    'huck',     'hued',     'huer',     'hues',     'huff',     'huge',     'hugs',     'hugy',     'huhu',     'huia',
    'huic',     'huis',     'hula',     'hule',     'hulk',     'hull',     'huma',     'humf',     'hump',     'hums',
    'hung',     'hunh',     'hunk',     'huns',     'hunt',     'hups',     'hurl',     'hurt',     'hush',     'husk',
    'huso',     'huss',     'huts',     'hwan',     'hwyl',     'hyed',     'hyen',     'hyes',     'hyke',     'hyla',
    'hyle',     'hymn',     'hype',     'hypo',     'hyps',     'hyte',     'iamb',     'ibex',     'ibis',     'iced',
    'icer',     'ices',     'ichs',     'icks',     'icky',     'icon',     'idea',     'idee',     'idem',     'ides',
    'idle',     'idly',     'idol',     'idyl',     'iffy',     'igad',     'iggs',     'iglu',     'ikan',     'ikat',
    'ikon',     'ilea',     'ilex',     'ilia',     'ilka',     'ilks',     'ills',     'illy',     'imam',     'imid',
    'imma',     'immy',     'impi',     'imps',     'inby',     'inch',     'indy',     'info',     'ingo',     'ings',
    'inia',     'inks',     'inky',     'inly',     'inns',     'inro',     'inti',     'into',     'ints',     'ions',
    'iota',     'ired',     'ires',     'irid',     'iris',     'irks',     'iron',     'isba',     'isit',     'isle',
    'isms',     'isna',     'isos',     'itas',     'itch',     'item',     'iure',     'iwis',     'ixia',     'izar',
    'jaap',     'jabs',     'jack',     'jade',     'jafa',     'jaga',     'jagg',     'jags',     'jail',     'jake',
    'jaks',     'jamb',     'jams',     'jane',     'jann',     'jape',     'japs',     'jark',     'jarl',     'jarp',
    'jars',     'jasp',     'jass',     'jasy',     'jato',     'jauk',     'jaup',     'java',     'jaws',     'jaxy',
    'jays',     'jazy',     'jazz',     'jean',     'jeat',     'jedi',     'jeed',     'jeel',     'jeep',     'jeer',
    'jees',     'jeez',     'jefe',     'jeff',     'jehu',     'jell',     'jeon',     'jerk',     'jess',     'jest',
    'jete',     'jets',     'jeux',     'jiao',     'jibb',     'jibe',     'jibs',     'jiff',     'jigs',     'jill',
    'jilt',     'jimp',     'jink',     'jinn',     'jins',     'jinx',     'jird',     'jism',     'jive',     'jivy',
    'jizz',     'jobe',     'jobs',     'jock',     'joco',     'joes',     'joey',     'jogs',     'john',     'join',
    'joke',     'joky',     'jole',     'joll',     'jols',     'jolt',     'jomo',     'jong',     'jook',     'jors',
    'josh',     'joss',     'jota',     'jots',     'jouk',     'jour',     'jowl',     'jows',     'joys',     'juba',
    'jube',     'juco',     'judo',     'juds',     'judy',     'juga',     'jugs',     'juju',     'juke',     'juku',
    'jump',     'junk',     'jupe',     'jura',     'jure',     'jury',     'just',     'jute',     'juts',     'juve',
    'jynx',     'kaal',     'kaas',     'kabs',     'kack',     'kade',     'kadi',     'kaed',     'kaes',     'kafs',
    'kago',     'kagu',     'kaid',     'kaie',     'kaif',     'kaik',     'kail',     'kaim',     'kain',     'kais',
    'kaka',     'kaki',     'kaks',     'kale',     'kali',     'kama',     'kame',     'kami',     'kana',     'kane',
    'kang',     'kans',     'kant',     'kaon',     'kapa',     'kaph',     'kapu',     'kara',     'kark',     'karn',
    'karo',     'kart',     'kata',     'kati',     'kats',     'kava',     'kawa',     'kaws',     'kayo',     'kays',
    'kazi',     'kbar',     'keas',     'kebs',     'keck',     'keds',     'keef',     'keek',     'keel',     'keen',
    'keep',     'keet',     'kefs',     'kegs',     'keir',     'keks',     'kell',     'kelp',     'kelt',     'kemb',
    'kemp',     'keno',     'kens',     'kent',     'kepi',     'keps',     'kept',     'kerb',     'kerf',     'kern',
    'kero',     'kesh',     'kest',     'keta',     'kete',     'keto',     'kets',     'kewl',     'keys',     'khaf',
    'khan',     'khat',     'khet',     'khis',     'khor',     'khud',     'kibe',     'kick',     'kids',     'kief',
    'kier',     'kiev',     'kiff',     'kifs',     'kild',     'kill',     'kiln',     'kilo',     'kilp',     'kilt',
    'kina',     'kind',     'kine',     'king',     'kink',     'kino',     'kins',     'kipe',     'kipp',     'kips',
    'kirk',     'kirn',     'kirs',     'kish',     'kiss',     'kist',     'kite',     'kith',     'kits',     'kiva',
    'kiwi',     'klap',     'klik',     'knag',     'knap',     'knar',     'knee',     'knew',     'knit',     'knob',
    'knop',     'knot',     'know',     'knub',     'knur',     'knut',     'koan',     'koap',     'koas',     'kobo',
    'kobs',     'koel',     'koff',     'koha',     'kohl',     'kois',     'koji',     'koka',     'kola',     'kolo',
    'kond',     'konk',     'kons',     'kook',     'koph',     'kops',     'kora',     'kore',     'kori',     'koro',
    'kors',     'koru',     'koss',     'koto',     'kows',     'krab',     'krai',     'kray',     'kris',     'ksar',
    'kudo',     'kudu',     'kueh',     'kues',     'kufi',     'kuia',     'kuku',     'kula',     'kuna',     'kune',
    'kuri',     'kuru',     'kuta',     'kuti',     'kutu',     'kuzu',     'kvas',     'kyak',     'kyar',     'kyat',
    'kybo',     'kyes',     'kyle',     'kynd',     'kyne',     'kype',     'kyte',     'kyus',     'labs',     'lace',
    'lack',     'lacs',     'lacy',     'lade',     'lads',     'lady',     'laer',     'lags',     'lahs',     'laic',
    'laid',     'laik',     'lain',     'lair',     'lake',     'lakh',     'laky',     'lall',     'lama',     'lamb',
    'lame',     'lamp',     'lams',     'lana',     'land',     'lane',     'lang',     'lank',     'lant',     'lanx',
    'laps',     'lard',     'lare',     'lari',     'lark',     'larn',     'lars',     'lase',     'lash',     'lass',
    'last',     'late',     'lath',     'lati',     'lats',     'latu',     'laud',     'lauf',     'lava',     'lave',
    'lavs',     'lawk',     'lawn',     'laws',     'lays',     'laze',     'lazo',     'lazy',     'lead',     'leaf',
    'leak',     'leal',     'leam',     'lean',     'leap',     'lear',     'leas',     'leat',     'lech',     'lede',
    'leed',     'leek',     'leep',     'leer',     'lees',     'leet',     'left',     'legs',     'lehr',     'leir',
    'leis',     'leke',     'leks',     'leku',     'leme',     'lend',     'leng',     'leno',     'lens',     'lent',
    'leps',     'lept',     'lere',     'lerp',     'less',     'lest',     'lets',     'leud',     'leva',     'leve',
    'levo',     'levs',     'levy',     'lewd',     'lewk',     'leys',     'liar',     'lias',     'libs',     'lice',
    'lich',     'lick',     'lido',     'lids',     'lied',     'lief',     'lien',     'lier',     'lies',     'lieu',
    'life',     'lift',     'ligs',     'like',     'lill',     'lilo',     'lilt',     'lily',     'lima',     'limb',
    'lime',     'limn',     'limo',     'limp',     'limy',     'lind',     'line',     'ling',     'link',     'linn',
    'lino',     'lins',     'lint',     'liny',     'lion',     'lipa',     'lipe',     'lipo',     'lips',     'lira',
    'lire',     'liri',     'lirk',     'lisk',     'lisp',     'list',     'lite',     'lith',     'lits',     'litu',
    'live',     'load',     'loaf',     'loam',     'loan',     'lobe',     'lobi',     'lobo',     'lobs',     'loca',
    'loch',     'loci',     'lock',     'loco',     'locs',     'lode',     'lods',     'loft',     'loge',     'logo',
    'logs',     'logy',     'loid',     'loin',     'loir',     'loke',     'loll',     'lolz',     'loma',     'lome',
    'lone',     'long',     'loof',     'look',     'loom',     'loon',     'loop',     'loor',     'loos',     'loot',
    'lope',     'lops',     'lord',     'lore',     'lorn',     'lory',     'lose',     'losh',     'loss',     'lost',
    'lota',     'lote',     'loth',     'loti',     'loto',     'lots',     'loud',     'loun',     'loup',     'lour',
    'lous',     'lout',     'love',     'lowe',     'lown',     'lowp',     'lows',     'lowt',     'loys',     'luau',
    'lube',     'luce',     'luck',     'lude',     'ludo',     'luds',     'lues',     'luff',     'luge',     'lugs',
    'luit',     'luke',     'lull',     'lulu',     'lulz',     'luma',     'lump',     'lums',     'luna',     'lune',
    'lung',     'lunk',     'luns',     'lunt',     'luny',     'lure',     'lurk',     'lurs',     'lush',     'lusk',
    'lust',     'lute',     'lutz',     'luvs',     'luxe',     'lwei',     'lyam',     'lych',     'lyes',     'lyme',
    'lyms',     'lyne',     'lynx',     'lyra',     'lyre',     'lyse',     'lyte',     'maar',     'maas',     'mabe',
    'maca',     'mace',     'mach',     'mack',     'macs',     'made',     'mads',     'maes',     'mage',     'magg',
    'magi',     'mags',     'maha',     'maid',     'maik',     'mail',     'maim',     'main',     'mair',     'make',
    'maki',     'mako',     'maks',     'mala',     'male',     'mali',     'mall',     'malm',     'mals',     'malt',
    'mama',     'mams',     'mana',     'mand',     'mane',     'mang',     'mani',     'mano',     'mans',     'many',
    'maps',     'mara',     'marc',     'mard',     'mare',     'marg',     'mark',     'marl',     'marm',     'mars',
    'mart',     'mary',     'masa',     'mase',     'mash',     'mask',     'mass',     'mast',     'masu',     'mate',
    'math',     'mats',     'matt',     'maty',     'maud',     'maul',     'maun',     'maut',     'mawk',     'mawn',
    'mawr',     'maws',     'maxi',     'maya',     'mayo',     'mays',     'maze',     'mazy',     'mead',     'meal',
    'mean',     'meat',     'mech',     'meck',     'meds',     'meed',     'meek',     'meer',     'mees',     'meet',
    'meff',     'mega',     'megs',     'mein',     'mela',     'meld',     'mell',     'mels',     'melt',     'meme',
    'memo',     'mems',     'mend',     'mene',     'meng',     'meno',     'ment',     'menu',     'meou',     'meow',
    'merc',     'mere',     'meri',     'merk',     'merl',     'mesa',     'mese',     'mesh',     'mess',     'meta',
    'mete',     'meth',     'mets',     'meus',     'meve',     'mewl',     'mews',     'meze',     'mezz',     'mhos',
    'mibs',     'mica',     'mice',     'mich',     'mico',     'mics',     'midi',     'mids',     'mien',     'miff',
    'migg',     'migs',     'miha',     'mihi',     'mike',     'mild',     'mile',     'milf',     'milk',     'mill',
    'milo',     'mils',     'milt',     'mime',     'mina',     'mind',     'mine',     'ming',     'mini',     'mink',
    'mino',     'mint',     'minx',     'miny',     'mips',     'mire',     'miri',     'mirk',     'miro',     'mirs',
    'mirv',     'miry',     'mise',     'miso',     'miss',     'mist',     'mite',     'mitt',     'mity',     'mixt',
    'mixy',     'mizz',     'mnas',     'moai',     'moan',     'moas',     'moat',     'mobe',     'mobo',     'mobs',
    'moby',     'moch',     'mock',     'mocs',     'mode',     'modi',     'mods',     'moer',     'moes',     'mofo',
    'mogs',     'moho',     'mohr',     'moil',     'moit',     'mojo',     'moke',     'moki',     'moko',     'mola',
    'mold',     'mole',     'moll',     'mols',     'molt',     'moly',     'mome',     'momi',     'moms',     'mona',
    'mong',     'monk',     'mono',     'mons',     'mony',     'mood',     'mooi',     'mook',     'mool',     'moon',
    'moop',     'moor',     'moos',     'moot',     'mope',     'mops',     'mopy',     'mora',     'more',     'morn',
    'mors',     'mort',     'mose',     'mosh',     'mosk',     'moss',     'most',     'mote',     'moth',     'moti',
    'mots',     'mott',     'motu',     'moue',     'moup',     'mous',     'move',     'mowa',     'mown',     'mows',
    'moxa',     'moya',     'moyl',     'moys',     'moze',     'mozo',     'mozz',     'mpox',     'much',     'muck',
    'muds',     'muff',     'mugg',     'mugs',     'muid',     'muil',     'muir',     'mule',     'mull',     'mumm',
    'mump',     'mums',     'mumu',     'mung',     'muni',     'muns',     'muon',     'mura',     'mure',     'murk',
    'murl',     'murr',     'muse',     'mush',     'musk',     'muso',     'muss',     'must',     'mute',     'muti',
    'muts',     'mutt',     'muzz',     'mwah',     'myal',     'mycs',     'myna',     'myth',     'myxo',     'mzee',
    'naam',     'naan',     'nabe',     'nabk',     'nabs',     'nach',     'nada',     'nads',     'naes',     'naff',
    'naga',     'nags',     'naif',     'naik',     'nail',     'nain',     'nala',     'name',     'nams',     'namu',
    'nana',     'nane',     'nang',     'nano',     'nans',     'naoi',     'naos',     'napa',     'nape',     'naps',
    'narc',     'nard',     'nare',     'nark',     'nary',     'nats',     'nave',     'navs',     'navy',     'nays',
    'naze',     'nazi',     'neal',     'neap',     'near',     'neat',     'nebs',     'neck',     'neds',     'need',
    'neem',     'neep',     'nefs',     'negs',     'neif',     'neks',     'nema',     'nemn',     'nene',     'neon',
    'neps',     'nerd',     'nerf',     'nerk',     'nesh',     'ness',     'nest',     'nete',     'nets',     'nett',
    'neuk',     'neum',     'neve',     'nevi',     'newb',     'news',     'newt',     'next',     'ngai',     'nibs',
    'nice',     'nick',     'nide',     'nidi',     'nids',     'nied',     'nief',     'nies',     'nife',     'niff',
    'nigh',     'nill',     'nils',     'nimb',     'nims',     'nine',     'nipa',     'nips',     'nirl',     'nish',
    'nisi',     'nite',     'nits',     'nixe',     'nixy',     'noah',     'nobs',     'nock',     'node',     'nodi',
    'nods',     'noel',     'noes',     'nogg',     'nogs',     'noil',     'noir',     'nole',     'noll',     'nolo',
    'noma',     'nome',     'noms',     'nona',     'none',     'nong',     'noni',     'noob',     'nook',     'noon',
    'noop',     'nope',     'nori',     'nork',     'norm',     'nose',     'nosh',     'nosy',     'nota',     'note',
    'nott',     'noul',     'noun',     'noup',     'nous',     'nout',     'nova',     'nowl',     'nown',     'nows',
    'nowt',     'nowy',     'noys',     'nubs',     'nude',     'nuff',     'nugs',     'nuke',     'null',     'numb',
    'nuns',     'nurd',     'nurl',     'nurr',     'nurs',     'nuts',     'nyah',     'nyas',     'nyed',     'nyes',
    'oafs',     'oaks',     'oaky',     'oars',     'oary',     'oast',     'oath',     'oats',     'oaty',     'obas',
    'obes',     'obey',     'obia',     'obis',     'obit',     'oboe',     'obol',     'obos',     'obvs',     'ocas',
    'occy',     'oche',     'octa',     'odah',     'odal',     'odas',     'odds',     'odea',     'odes',     'odic',
    'odor',     'odso',     'odyl',     'offa',     'offs',     'offy',     'ogam',     'ogee',     'ogle',     'ogre',
    'ohed',     'ohia',     'ohms',     'oiks',     'oils',     'oily',     'oink',     'oint',     'okas',     'okay',
    'okeh',     'okes',     'okra',     'okta',     'olde',     'olds',     'oldy',     'olea',     'oleo',     'oles',
    'olid',     'olio',     'olla',     'olms',     'olpe',     'omas',     'ombu',     'omen',     'omer',     'omit',
    'omov',     'once',     'oner',     'ones',     'onie',     'only',     'onos',     'onst',     'onto',     'onus',
    'onyx',     'oofs',     'oofy',     'oohs',     'ooms',     'oons',     'oont',     'oops',     'oose',     'oosy',
    'oots',     'ooze',     'oozy',     'opah',     'opal',     'opas',     'oped',     'open',     'opes',     'oppo',
    'opts',     'opus',     'orad',     'oral',     'orbs',     'orby',     'orca',     'orcs',     'ordo',     'ords',
    'ores',     'orfe',     'orfs',     'orgs',     'orgy',     'orle',     'orra',     'orts',     'oryx',     'orzo',
    'osar',     'oses',     'ossa',     'otic',     'otto',     'ouch',     'ouds',     'ouks',     'ould',     'oulk',
    'ouma',     'oupa',     'ouph',     'oups',     'ourn',     'ours',     'oust',     'outa',     'outs',     'ouzo',
    'oval',     'ovel',     'oven',     'over',     'ovum',     'owed',     'ower',     'owes',     'owie',     'owls',
    'owly',     'owns',     'owre',     'owse',     'owts',     'oxen',     'oxer',     'oxes',     'oxic',     'oxid',
    'oxim',     'oyer',     'oyes',     'oyez',     'paal',     'paan',     'paca',     'pace',     'pack',     'paco',
    'pacs',     'pact',     'pacy',     'padi',     'pads',     'page',     'pahs',     'paid',     'paik',     'pail',
    'pain',     'pair',     'pais',     'paks',     'pale',     'pali',     'pall',     'palm',     'palp',     'pals',
    'paly',     'pams',     'pand',     'pane',     'pang',     'pans',     'pant',     'papa',     'pape',     'paps',
    'para',     'pard',     'pare',     'park',     'parm',     'parp',     'parr',     'pars',     'part',     'pase',
    'pash',     'pass',     'past',     'pate',     'path',     'pats',     'patu',     'paty',     'paua',     'paul',
    'pave',     'pavs',     'pawa',     'pawk',     'pawl',     'pawn',     'paws',     'pays',     'peag',     'peak',
    'peal',     'pean',     'pear',     'peas',     'peat',     'peba',     'pech',     'peck',     'pecs',     'pedi',
    'peds',     'peed',     'peek',     'peel',     'peen',     'peep',     'peer',     'pees',     'pegh',     'pegs',
    'pehs',     'pein',     'peke',     'pela',     'pele',     'pelf',     'pell',     'pels',     'pelt',     'pend',
    'pene',     'peng',     'peni',     'penk',     'pens',     'pent',     'peon',     'pepo',     'peps',     'perc',
    'pere',     'peri',     'perk',     'perm',     'pern',     'perp',     'pert',     'perv',     'peso',     'pest',
    'pets',     'pews',     'pfft',     'pfui',     'phat',     'pheo',     'phew',     'phis',     'phiz',     'phoh',
    'phon',     'phos',     'phot',     'phut',     'pial',     'pian',     'pias',     'pica',     'pice',     'pick',
    'pics',     'pied',     'pier',     'pies',     'piet',     'pigs',     'pika',     'pike',     'piki',     'pila',
    'pile',     'pili',     'pill',     'pily',     'pima',     'pimp',     'pina',     'pine',     'ping',     'pink',
    'pins',     'pint',     'piny',     'pion',     'pioy',     'pipa',     'pipe',     'pipi',     'pips',     'pipy',
    'pirl',     'pirn',     'pirs',     'pise',     'pish',     'piso',     'piss',     'pita',     'pith',     'pits',
    'pity',     'pium',     'pixy',     'pize',     'plan',     'plap',     'plat',     'play',     'plea',     'pleb',
    'pled',     'plew',     'plex',     'plie',     'plim',     'plod',     'plop',     'plot',     'plow',     'ploy',
    'plue',     'plug',     'plum',     'plus',     'poas',     'pock',     'poco',     'pods',     'poem',     'poep',
    'poet',     'pogo',     'pogy',     'pohs',     'pois',     'poke',     'poky',     'pole',     'polk',     'poll',
    'polo',     'pols',     'polt',     'poly',     'pome',     'pomo',     'pomp',     'poms',     'pond',     'pone',
    'pong',     'ponk',     'pons',     'pont',     'pony',     'pood',     'poof',     'pooh',     'pook',     'pool',
    'poon',     'poop',     'poor',     'poos',     'poot',     'pope',     'pops',     'pore',     'pork',     'porn',
    'port',     'pory',     'pose',     'posh',     'poss',     'post',     'posy',     'pote',     'pots',     'pott',
    'pouf',     'pouk',     'pour',     'pout',     'pown',     'pows',     'poxy',     'pozz',     'prad',     'pram',
    'prao',     'prat',     'prau',     'pray',     'pree',     'prem',     'prep',     'prex',     'prey',     'prez',
    'prig',     'prim',     'proa',     'prob',     'prod',     'prof',     'prog',     'prom',     'proo',     'prop',
    'pros',     'prow',     'pruh',     'prys',     'psis',     'psst',     'ptui',     'pube',     'pubs',     'puce',
    'puck',     'puds',     'pudu',     'puer',     'puff',     'pugh',     'pugs',     'puha',     'puir',     'puja',
    'puka',     'puke',     'puku',     'puky',     'pula',     'pule',     'puli',     'pulk',     'pull',     'pulp',
    'puls',     'pulu',     'puly',     'puma',     'pump',     'pumy',     'puna',     'pung',     'punk',     'puns',
    'punt',     'puny',     'pupa',     'pups',     'pupu',     'pure',     'puri',     'purl',     'purr',     'purs',
    'push',     'puss',     'puts',     'putt',     'putz',     'puys',     'pwns',     'pyas',     'pyat',     'pyes',
    'pyet',     'pyic',     'pyin',     'pyne',     'pyot',     'pyre',     'pyro',     'qadi',     'qaid',     'qats',
    'qins',     'qoph',     'quad',     'quag',     'quai',     'quat',     'quay',     'quep',     'quey',     'quid',
    'quim',     'quin',     'quip',     'quit',     'quiz',     'quod',     'quop',     'rabi',     'raca',     'race',
    'rach',     'rack',     'racy',     'rade',     'rads',     'raff',     'raft',     'raga',     'rage',     'ragg',
    'ragi',     'rags',     'ragu',     'rahs',     'raia',     'raid',     'raik',     'rail',     'rain',     'rais',
    'rait',     'raja',     'rake',     'raki',     'raku',     'rale',     'rami',     'ramp',     'rams',     'rana',
    'rand',     'rang',     'rani',     'rank',     'rant',     'rape',     'raps',     'rapt',     'rare',     'rark',
    'rase',     'rash',     'rasp',     'rast',     'rata',     'rate',     'rath',     'rato',     'rats',     'ratu',
    'raun',     'rave',     'ravs',     'rawn',     'raws',     'raya',     'rays',     'raze',     'razz',     'read',
    'reak',     'real',     'ream',     'rean',     'reap',     'rear',     'rebs',     'reck',     'recs',     'redd',
    'rede',     'redo',     'reds',     'reed',     'reef',     'reek',     'reel',     'reen',     'rees',     'refi',
    'refs',     'reft',     'rego',     'regs',     'rehs',     'reif',     'reik',     'rein',     'reis',     'reke',
    'rely',     'rems',     'rend',     'renk',     'reno',     'rens',     'rent',     'reny',     'reos',     'repo',
    'repp',     'reps',     'resh',     'rest',     'rete',     'rets',     'revs',     'rews',     'rhea',     'rhos',
    'rhus',     'riad',     'rial',     'rias',     'riba',     'ribs',     'rice',     'rich',     'rick',     'ricy',
    'ride',     'rids',     'riel',     'riem',     'rife',     'riff',     'rifs',     'rift',     'rigg',     'rigs',
    'rile',     'rill',     'rima',     'rime',     'rims',     'rimu',     'rimy',     'rind',     'rine',     'ring',
    'rink',     'rins',     'riot',     'ripe',     'ripp',     'rips',     'ript',     'rise',     'risk',     'risp',
    'rite',     'rits',     'ritt',     'ritz',     'riva',     'rive',     'rivo',     'riza',     'road',     'roam',
    'roan',     'roar',     'robe',     'robs',     'roch',     'rock',     'rocs',     'rode',     'rods',     'roed',
    'roes',     'rohe',     'roid',     'roil',     'roin',     'roji',     'roke',     'roks',     'roky',     'role',
    'rolf',     'roll',     'roma',     'romp',     'roms',     'rona',     'rone',     'rong',     'ront',     'ronz',
    'rood',     'roof',     'rook',     'room',     'roon',     'roop',     'roos',     'root',     'rope',     'ropy',
    'rore',     'rort',     'rory',     'rose',     'rost',     'rosy',     'rota',     'rote',     'roti',     'rotl',
    'roto',     'rots',     'roue',     'roul',     'roum',     'roup',     'rout',     'roux',     'rove',     'rows',
    'rowt',     'rube',     'rubs',     'ruby',     'ruck',     'rucs',     'rudd',     'rude',     'rudi',     'ruds',
    'rudy',     'rued',     'ruer',     'rues',     'ruff',     'ruga',     'rugs',     'ruin',     'rukh',     'rule',
    'ruly',     'rume',     'rump',     'rums',     'rund',     'rune',     'rung',     'runs',     'runt',     'rurp',
    'ruru',     'rusa',     'ruse',     'rush',     'rusk',     'rust',     'ruth',     'ruts',     'ryal',     'ryas',
    'ryes',     'ryfe',     'ryke',     'rynd',     'ryot',     'rype',     'ryus',     'saag',     'sabe',     'sabs',
    'sack',     'sacs',     'sade',     'sadi',     'sado',     'sads',     'safe',     'saft',     'saga',     'sage',
    'sago',     'sags',     'sagy',     'saic',     'said',     'sail',     'saim',     'sain',     'sair',     'sais',
    'sake',     'saki',     'sale',     'sall',     'salp',     'sals',     'salt',     'sama',     'same',     'samp',
    'sams',     'sand',     'sane',     'sang',     'sank',     'sans',     'sant',     'saps',     'sard',     'sari',
    'sark',     'sars',     'sash',     'sass',     'sate',     'sati',     'saul',     'saut',     'save',     'savs',
    'sawn',     'saws',     'saxe',     'says',     'scab',     'scad',     'scag',     'scam',     'scan',     'scar',
    'scat',     'scaw',     'scog',     'scop',     'scot',     'scow',     'scry',     'scud',     'scug',     'scul',
    'scum',     'scup',     'scur',     'scut',     'scye',     'seal',     'seam',     'sean',     'sear',     'seas',
    'seat',     'seax',     'sech',     'seco',     'secs',     'sect',     'seed',     'seek',     'seel',     'seem',
    'seen',     'seep',     'seer',     'sees',     'sego',     'segs',     'seif',     'seik',     'seil',     'seir',
    'seis',     'sekt',     'seld',     'sele',     'self',     'sell',     'sels',     'seme',     'semi',     'sena',
    'send',     'sene',     'sens',     'sent',     'seps',     'sept',     'sera',     'sere',     'serf',     'serk',
    'serr',     'sers',     'sese',     'sesh',     'sess',     'seta',     'sets',     'sett',     'sevs',     'sewn',
    'sews',     'sext',     'sexy',     'seys',     'shad',     'shag',     'shah',     'sham',     'shan',     'shat',
    'shaw',     'shay',     'shea',     'shed',     'shen',     'shes',     'shet',     'shew',     'shhh',     'shim',
    'shin',     'ship',     'shir',     'shit',     'shiv',     'shmo',     'shod',     'shoe',     'shog',     'shoo',
    'shop',     'shot',     'show',     'shri',     'shul',     'shun',     'shut',     'shwa',     'sial',     'sibb',
    'sibs',     'sice',     'sich',     'sick',     'sics',     'sida',     'side',     'sidh',     'sien',     'sies',
    'sift',     'sigh',     'sign',     'sigs',     'sijo',     'sika',     'sike',     'sild',     'sile',     'silk',
    'sill',     'silo',     'silt',     'sima',     'simi',     'simp',     'sims',     'sind',     'sine',     'sing',
    'sinh',     'sink',     'sins',     'sipe',     'sips',     'sire',     'siri',     'sirs',     'siss',     'sist',
    'site',     'sith',     'sits',     'sitz',     'size',     'sizy',     'sjoe',     'skag',     'skas',     'skat',
    'skaw',     'sked',     'skee',     'skeg',     'sken',     'skeo',     'skep',     'sker',     'sket',     'skew',
    'skid',     'skim',     'skin',     'skio',     'skip',     'skis',     'skit',     'skog',     'skol',     'skry',
    'skua',     'skug',     'skyf',     'skyr',     'slab',     'slae',     'slag',     'slam',     'slap',     'slat',
    'slaw',     'slay',     'sleb',     'sled',     'slee',     'slew',     'sley',     'slid',     'slim',     'slip',
    'slit',     'slob',     'sloe',     'slog',     'slop',     'slot',     'slow',     'slub',     'slue',     'slug',
    'slum',     'slur',     'slut',     'smee',     'smew',     'smir',     'smit',     'smog',     'smug',     'smur',
    'smut',     'snab',     'snag',     'snap',     'snar',     'snaw',     'sneb',     'sned',     'snee',     'snib',
    'snig',     'snip',     'snit',     'snob',     'snod',     'snog',     'snot',     'snow',     'snub',     'snug',
    'snye',     'soak',     'soap',     'soar',     'soba',     'sobs',     'soca',     'sock',     'socs',     'soda',
    'sods',     'sofa',     'soft',     'sogs',     'soho',     'sohs',     'soil',     'soja',     'soju',     'soke',
    'sola',     'sold',     'sole',     'soli',     'solo',     'sols',     'soma',     'some',     'soms',     'somy',
    'sone',     'song',     'sons',     'sook',     'sool',     'soom',     'soon',     'soop',     'soot',     'soph',
    'sops',     'sora',     'sorb',     'sord',     'sore',     'sori',     'sorn',     'sort',     'soss',     'soth',
    'sots',     'souk',     'soul',     'soum',     'soup',     'sour',     'sous',     'sout',     'sovs',     'sowf',
    'sowl',     'sowm',     'sown',     'sowp',     'sows',     'soya',     'soys',     'spae',     'spag',     'spam',
    'span',     'spar',     'spas',     'spat',     'spaw',     'spay',     'spec',     'sped',     'spek',     'spet',
    'spew',     'spie',     'spif',     'spim',     'spin',     'spit',     'spiv',     'spod',     'spot',     'spry',
    'spud',     'spue',     'spug',     'spun',     'spur',     'sris',     'stab',     'stag',     'stan',     'stap',
    'star',     'stat',     'staw',     'stay',     'sted',     'stem',     'sten',     'step',     'stet',     'stew',
    'stey',     'stie',     'stim',     'stir',     'stoa',     'stob',     'stop',     'stot',     'stow',     'stub',
    'stud',     'stum',     'stun',     'stye',     'suba',     'subs',     'such',     'suck',     'sudd',     'suds',
    'sued',     'suer',     'sues',     'suet',     'sugh',     'sugo',     'sugs',     'suid',     'suit',     'sukh',
    'suks',     'sulk',     'sulu',     'sumi',     'sumo',     'sump',     'sums',     'sumy',     'sung',     'suni',
    'sunk',     'sunn',     'suns',     'supe',     'sups',     'suqs',     'sura',     'surd',     'sure',     'surf',
    'suss',     'susu',     'swab',     'swad',     'swag',     'swam',     'swan',     'swap',     'swat',     'sway',
    'swee',     'swey',     'swig',     'swim',     'swiz',     'swob',     'swop',     'swot',     'swum',     'sybo',
    'syce',     'syed',     'syen',     'syes',     'syke',     'syli',     'sync',     'synd',     'syne',     'sype',
    'syph',     'taal',     'tabi',     'tabs',     'tabu',     'tace',     'tach',     'tack',     'taco',     'tact',
    'tads',     'taed',     'tael',     'taes',     'tags',     'taha',     'tahr',     'tail',     'tain',     'tais',
    'tait',     'taka',     'take',     'taki',     'taks',     'taky',     'tala',     'talc',     'tale',     'tali',
    'talk',     'tall',     'tame',     'tamp',     'tams',     'tana',     'tane',     'tang',     'tanh',     'tank',
    'tans',     'taos',     'tapa',     'tape',     'taps',     'tapu',     'tara',     'tare',     'tarn',     'taro',
    'tarp',     'tars',     'tart',     'tase',     'tash',     'task',     'tass',     'tate',     'tath',     'tats',
    'tatt',     'tatu',     'taus',     'taut',     'tava',     'tavs',     'tawa',     'taws',     'tawt',     'taxa',
    'taxi',     'tays',     'tead',     'teak',     'teal',     'team',     'tear',     'teas',     'teat',     'tech',
    'tecs',     'teds',     'tedy',     'teed',     'teek',     'teel',     'teem',     'teen',     'teer',     'tees',
    'teff',     'tefs',     'tegg',     'tegs',     'tegu',     'tehr',     'teil',     'tein',     'tela',     'teld',
    'tele',     'tell',     'tels',     'telt',     'teme',     'temp',     'tems',     'tend',     'tene',     'tens',
    'tent',     'tepa',     'terf',     'term',     'tern',     'test',     'tete',     'teth',     'tets',     'tews',
    'text',     'thae',     'than',     'thar',     'that',     'thaw',     'thee',     'them',     'then',     'thew',
    'they',     'thig',     'thin',     'thio',     'thir',     'this',     'thon',     'thou',     'thro',     'thru',
    'thud',     'thug',     'thus',     'tian',     'tiar',     'tice',     'tich',     'tick',     'tics',     'tide',
    'tids',     'tidy',     'tied',     'tier',     'ties',     'tiff',     'tifo',     'tift',     'tige',     'tigs',
    'tika',     'tike',     'tiki',     'tiks',     'tile',     'till',     'tils',     'tilt',     'time',     'tina',
    'tind',     'tine',     'ting',     'tink',     'tins',     'tint',     'tiny',     'tipi',     'tips',     'tipt',
    'tire',     'tirl',     'tiro',     'tirr',     'tite',     'titi',     'tits',     'tivy',     'tiyn',     'tizz',
    'toad',     'toby',     'tock',     'toco',     'tocs',     'tods',     'tody',     'toea',     'toed',     'toes',
    'toey',     'toff',     'toft',     'tofu',     'toga',     'toge',     'togs',     'toho',     'toil',     'toit',
    'toke',     'toko',     'tola',     'told',     'tole',     'toll',     'tolt',     'tolu',     'tomb',     'tome',
    'tomo',     'toms',     'tone',     'tong',     'tonk',     'tons',     'tony',     'took',     'tool',     'toom',
    'toon',     'toot',     'tope',     'toph',     'topi',     'topo',     'tops',     'tora',     'torc',     'tore',
    'tori',     'torn',     'toro',     'torr',     'tors',     'tort',     'tory',     'tosa',     'tose',     'tosh',
    'toss',     'tost',     'tote',     'tots',     'touk',     'toun',     'tour',     'tout',     'town',     'tows',
    'towt',     'towy',     'toyo',     'toys',     'toze',     'trad',     'tram',     'trap',     'trat',     'tray',
    'tree',     'tref',     'trek',     'trem',     'tres',     'tret',     'trew',     'trey',     'trez',     'trie',
    'trig',     'trim',     'trin',     'trio',     'trip',     'trod',     'trog',     'tron',     'trop',     'trot',
    'trou',     'trow',     'troy',     'true',     'trug',     'trye',     'tryp',     'tsar',     'tsks',     'tuan',
    'tuba',     'tube',     'tubs',     'tuck',     'tufa',     'tuff',     'tuft',     'tugs',     'tuis',     'tule',
    'tump',     'tums',     'tuna',     'tund',     'tune',     'tung',     'tuns',     'tuny',     'tups',     'turd',
    'turf',     'turk',     'turm',     'turn',     'turr',     'tush',     'tusk',     'tuts',     'tutu',     'tuzz',
    'twae',     'twal',     'twas',     'twat',     'tway',     'twee',     'twig',     'twin',     'twit',     'twos',
    'tyde',     'tyed',     'tyee',     'tyer',     'tyes',     'tygs',     'tyin',     'tyke',     'tymp',     'tynd',
    'tyne',     'type',     'typo',     'typp',     'typy',     'tyre',     'tyro',     'tyte',     'tzar',     'udal',
    'udon',     'udos',     'ueys',     'ufos',     'ughs',     'ugly',     'ukes',     'ulan',     'ules',     'ulex',
    'ulna',     'ulus',     'ulva',     'umbo',     'umes',     'umma',     'umph',     'umps',     'umpy',     'umra',
    'umus',     'unai',     'unau',     'unbe',     'unce',     'unci',     'unco',     'unde',     'undo',     'undy',
    'unis',     'unit',     'unto',     'upas',     'upby',     'updo',     'upgo',     'upon',     'upsy',     'upta',
    'urao',     'urbs',     'urde',     'urds',     'urdy',     'urea',     'ures',     'urge',     'uric',     'urns',
    'urps',     'ursa',     'urus',     'urva',     'used',     'user',     'uses',     'utas',     'utes',     'utis',
    'utus',     'uvae',     'uvas',     'uvea',     'vacs',     'vade',     'vaes',     'vagi',     'vags',     'vail',
    'vain',     'vair',     'vale',     'vali',     'vamp',     'vane',     'vang',     'vans',     'vant',     'vape',
    'vara',     'vare',     'vars',     'vary',     'vasa',     'vase',     'vast',     'vats',     'vatu',     'vaus',
    'vaut',     'vavs',     'vaws',     'vaxx',     'veal',     'veep',     'veer',     'vees',     'vega',     'vego',
    'vehm',     'veil',     'vein',     'vela',     'veld',     'vele',     'vell',     'vena',     'vend',     'vent',
    'vera',     'verb',     'verd',     'vers',     'vert',     'very',     'vest',     'veto',     'vets',     'vext',
    'viae',     'vial',     'vias',     'vibe',     'vibs',     'vice',     'vide',     'vids',     'vied',     'vier',
    'vies',     'view',     'viff',     'viga',     'vigs',     'vild',     'vile',     'vill',     'vims',     'vina',
    'vine',     'vino',     'vins',     'vint',     'viny',     'viol',     'vire',     'virl',     'visa',     'vise',
    'vita',     'vite',     'viva',     'vive',     'vivo',     'vizy',     'vlei',     'vlog',     'voar',     'voes',
    'vogs',     'void',     'voip',     'vola',     'vole',     'volk',     'vols',     'volt',     'voms',     'vors',
    'vote',     'vows',     'vril',     'vrot',     'vrou',     'vrow',     'vugg',     'vugh',     'vugs',     'vuln',
    'vums',     'waac',     'waah',     'wabs',     'wack',     'wadd',     'wade',     'wadi',     'wads',     'wadt',
    'wady',     'waes',     'waff',     'waft',     'wage',     'wags',     'waid',     'waif',     'wail',     'wain',
    'wair',     'wais',     'wait',     'waka',     'wake',     'wakf',     'wald',     'wale',     'wali',     'walk',
    'wall',     'waly',     'wame',     'wand',     'wane',     'wang',     'wank',     'wans',     'want',     'wany',
    'waps',     'waqf',     'warb',     'ward',     'ware',     'wark',     'warm',     'warn',     'warp',     'wars',
    'wart',     'wary',     'wase',     'wash',     'wasm',     'wasp',     'wast',     'wate',     'wats',     'watt',
    'wauk',     'waul',     'waur',     'wave',     'wavy',     'wawa',     'wawe',     'wawl',     'waws',     'waxy',
    'ways',     'wazz',     'weak',     'weal',     'wean',     'wear',     'webs',     'weds',     'weed',     'week',
    'weel',     'weem',     'ween',     'weep',     'weer',     'wees',     'weet',     'weft',     'weid',     'weil',
    'weir',     'weka',     'weld',     'welk',     'well',     'welp',     'wels',     'welt',     'wemb',     'wems',
    'wena',     'wend',     'wens',     'went',     'wept',     'were',     'wero',     'wert',     'west',     'weta',
    'wets',     'wexe',     'weys',     'whae',     'wham',     'whap',     'what',     'whee',     'when',     'whet',
    'whew',     'whey',     'whid',     'whig',     'whim',     'whin',     'whio',     'whip',     'whir',     'whit',
    'whiz',     'whoa',     'whom',     'whop',     'whot',     'whow',     'whup',     'whys',     'wice',     'wich',
    'wick',     'wide',     'wiel',     'wife',     'wigs',     'wiki',     'wild',     'wile',     'wili',     'will',
    'wilt',     'wily',     'wimp',     'wind',     'wine',     'wing',     'wink',     'winn',     'wino',     'wins',
    'winy',     'wipe',     'wire',     'wiry',     'wise',     'wish',     'wisp',     'wiss',     'wist',     'wite',
    'with',     'wits',     'wive',     'woad',     'woah',     'wock',     'woes',     'wofs',     'woke',     'woks',
    'wold',     'wolf',     'womb',     'wonk',     'wons',     'wont',     'wood',     'woof',     'wool',     'woon',
    'woos',     'woot',     'wops',     'word',     'wore',     'work',     'worm',     'worn',     'wort',     'wost',
    'wots',     'wove',     'wowf',     'wows',     'wrap',     'wren',     'writ',     'wuds',     'wudu',     'wull',
    'wuss',     'wych',     'wyes',     'wyle',     'wynd',     'wynn',     'wyns',     'wyte',     'xray',     'xyst',
    'yaar',     'yaba',     'yack',     'yads',     'yaff',     'yage',     'yagi',     'yags',     'yahs',     'yaje',
    'yaks',     'yald',     'yale',     'yams',     'yang',     'yank',     'yapp',     'yaps',     'yard',     'yare',
    'yark',     'yarn',     'yarr',     'yate',     'yaud',     'yaup',     'yawl',     'yawn',     'yawp',     'yaws',
    'yawy',     'yays',     'ybet',     'yead',     'yeah',     'yean',     'year',     'yeas',     'yebo',     'yech',
    'yede',     'yeed',     'yeet',     'yegg',     'yeld',     'yelk',     'yell',     'yelm',     'yelp',     'yelt',
    'yens',     'yeow',     'yeps',     'yerd',     'yerk',     'yesk',     'yest',     'yeti',     'yett',     'yeuk',
    'yeve',     'yews',     'ygoe',     'yike',     'yill',     'yins',     'yipe',     'yips',     'yird',     'yirk',
    'yirr',     'yite',     'ylem',     'ylke',     'ympe',     'ympt',     'yobs',     'yock',     'yode',     'yodh',
    'yods',     'yoga',     'yogh',     'yogi',     'yoke',     'yoks',     'yold',     'yolk',     'yomp',     'yond',
    'yoni',     'yont',     'yoof',     'yoop',     'yore',     'york',     'yorp',     'yote',     'youk',     'your',
    'yous',     'yowe',     'yowl',     'yows',     'yuan',     'yuca',     'yuch',     'yuck',     'yuft',     'yuga',
    'yugs',     'yuke',     'yuko',     'yuks',     'yuky',     'yule',     'yump',     'yunx',     'yups',     'yurt',
    'yutz',     'yuzu',     'ywis',     'zack',     'zags',     'zany',     'zaps',     'zarf',     'zari',     'zati',
    'zeal',     'zeas',     'zebu',     'zeda',     'zeds',     'zees',     'zein',     'zeks',     'zels',     'zens',
    'zeps',     'zerk',     'zero',     'zest',     'zeta',     'zeze',     'zhos',     'ziff',     'zigs',     'zila',
    'zill',     'zimb',     'zinc',     'zine',     'zing',     'zins',     'zips',     'zite',     'ziti',     'zits',
    'zizz',     'zobo',     'zobu',     'zoea',     'zoic',     'zols',     'zona',     'zone',     'zonk',     'zoom',
    'zoon',     'zoos',     'zoot',     'zori',     'zouk',     'zuke',     'zulu',     'zupa',     'zurf',     'zyga',
    'zyme',     'zzzs'
];

// Create dictionaries object for easy access
const DICTIONARIES = {
    2: DICTIONARY_2,
    3: DICTIONARY_3,
    4: DICTIONARY_4
};

// Create Sets for O(1) lookups
const DICTIONARY_SETS = {
    2: new Set(DICTIONARY_2),
    3: new Set(DICTIONARY_3),
    4: new Set(DICTIONARY_4)
};

// Create maps of alphagrams to their valid words
const ALPHAGRAM_MAPS = {
    2: new Map(),
    3: new Map(),
    4: new Map()
};

// Initialize the alphagram maps for all word lengths
function initializeAlphagramMaps() {
    for (const [length, dictionary] of Object.entries(DICTIONARIES)) {
        const lengthNum = parseInt(length);
        for (const word of dictionary) {
            const alphagram = createAlphagram(word);
            if (!ALPHAGRAM_MAPS[lengthNum].has(alphagram)) {
                ALPHAGRAM_MAPS[lengthNum].set(alphagram, []);
            }
            // Only add if not already present to avoid duplicates
            const existingWords = ALPHAGRAM_MAPS[lengthNum].get(alphagram);
            if (!existingWords.includes(word)) {
                existingWords.push(word);
            }
        }
    }
}

// Helper function to create an alphagram (sorted letters) from a word
function createAlphagram(word) {
    return word.toLowerCase().split('').sort().join('');
}

// Check if a word is valid for a specific length (case-insensitive)
function isValidWord(word, length = null) {
    const lowerWord = word.toLowerCase();
    if (length) {
        return DICTIONARY_SETS[length] && DICTIONARY_SETS[length].has(lowerWord);
    }
    // Check all lengths if no specific length provided
    return Object.values(DICTIONARY_SETS).some(set => set.has(lowerWord));
}

// Get all valid anagrams for a given alphagram and word length
function getValidAnagrams(alphagram, length) {
    return ALPHAGRAM_MAPS[length] && ALPHAGRAM_MAPS[length].get(alphagram) || [];
}

// Generate a random word from the dictionary of specified length
function getRandomWord(length = 4) {
    const dictionary = DICTIONARIES[length];
    if (!dictionary) return null;
    return dictionary[Math.floor(Math.random() * dictionary.length)];
}

// Generate a fake alphagram that doesn't have valid anagrams for specified length
function generateFakeAlphagram(length = 4) {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W']; // Excluded J, X, Q, K, Z, Y
    const excludedLetters = ['J', 'X', 'Q', 'K', 'Z', 'Y'];
    
    const maxAttempts = 100;
    let attempts = 0;
    
    // Get all valid alphagrams for this length as an array for random selection
    const validAlphagrams = Array.from(ALPHAGRAM_MAPS[length].keys());
    
    while (attempts < maxAttempts) {
        // Step 1: Select a random valid alphagram
        const baseAlphagram = validAlphagrams[Math.floor(Math.random() * validAlphagrams.length)];
        const letters = baseAlphagram.toUpperCase().split('');
        
        // Step 2: Remove a random letter
        const positionToRemove = Math.floor(Math.random() * letters.length);
        const removedLetter = letters[positionToRemove];
        letters.splice(positionToRemove, 1);
        
        // Step 3: Add a replacement letter that creates an invalid alphagram
        let replacementLetter;
        if (vowels.includes(removedLetter)) {
            // Replace vowel with consonant
            replacementLetter = consonants[Math.floor(Math.random() * consonants.length)];
        } else {
            // Replace consonant with vowel or different consonant
            const allReplacements = [...vowels, ...consonants];
            replacementLetter = allReplacements[Math.floor(Math.random() * allReplacements.length)];
        }
        
        letters.push(replacementLetter);
        
        // Create the fake alphagram
        const fakeAlphagram = letters.sort().join('').toLowerCase();
        
        // Step 4: Verify it's not a valid alphagram for this length
        if (!ALPHAGRAM_MAPS[length].has(fakeAlphagram)) {
            return fakeAlphagram.toUpperCase();
        }
        
        attempts++;
    }
    
    // Fallback: create a completely random invalid combination
    const letters = [];
    for (let i = 0; i < length; i++) {
        if (i === 0 || Math.random() < 0.3) {
            letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
        } else {
            letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
        }
    }
    
    return letters.sort().join('');
}

// Helper function to check if an alphagram has any valid anagrams for a specific length
function hasValidAnagrams(alphagram, length) {
    // First check if it's already in our valid alphagram map for this length
    if (ALPHAGRAM_MAPS[length] && ALPHAGRAM_MAPS[length].has(alphagram.toLowerCase())) {
        return true;
    }
    
    // Generate all permutations and check against dictionary for this length
    const permutations = generatePermutations(alphagram);
    
    for (const permutation of permutations) {
        if (DICTIONARY_SETS[length] && DICTIONARY_SETS[length].has(permutation.toLowerCase())) {
            return true;
        }
    }
    
    return false;
}

// Helper function to generate all permutations of a string
function generatePermutations(str) {
    if (str.length <= 1) return [str];
    
    const permutations = [];
    const chars = str.split('');
    
    // Use a more efficient approach for longer strings
    if (str.length > 7) {
        // For longer strings, just sample some permutations to avoid performance issues
        const sampleSize = Math.min(1000, factorial(str.length));
        const seen = new Set();
        
        for (let i = 0; i < sampleSize; i++) {
            const shuffled = [...chars].sort(() => Math.random() - 0.5).join('');
            if (!seen.has(shuffled)) {
                seen.add(shuffled);
                permutations.push(shuffled);
            }
        }
        
        return permutations;
    }
    
    // For shorter strings, generate all permutations
    function permute(arr, start = 0) {
        if (start === arr.length - 1) {
            permutations.push(arr.join(''));
            return;
        }
        
        for (let i = start; i < arr.length; i++) {
            [arr[start], arr[i]] = [arr[i], arr[start]];
            permute(arr, start + 1);
            [arr[start], arr[i]] = [arr[i], arr[start]];
        }
    }
    
    permute([...chars]);
    return [...new Set(permutations)]; // Remove duplicates
}

// Helper function to calculate factorial (for sampling logic)
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// Generate a game with randomized real and fake alphagrams (always totaling 20)
function generateGame(selectedLengths = [4]) {
    const totalAlphagrams = 20;
    const alphagrams = [];
    
    // Calculate distribution per length (approximately equal)
    const lengthsCount = selectedLengths.length;
    const baseCount = Math.floor(totalAlphagrams / lengthsCount);
    const remainder = totalAlphagrams % lengthsCount;
    
    // Create distribution array
    const distribution = selectedLengths.map((length, index) => ({
        length,
        count: baseCount + (index < remainder ? 1 : 0)
    }));
    
    console.log('Word length distribution:', distribution);
    
    // Generate alphagrams for each length
    for (const { length, count } of distribution) {
        // 15-25% should be fake (aim for ~20%)
        const fakeCount = Math.max(1, Math.floor(count * 0.2));
        const realCount = count - fakeCount;
        
        console.log(`Length ${length}: ${realCount} real, ${fakeCount} fake`);
        
        // Get real alphagrams for this length
        const availableAlphagrams = Array.from(ALPHAGRAM_MAPS[length].entries())
            .filter(([_, words]) => words.length > 0)
            .sort(() => Math.random() - 0.5)
            .slice(0, realCount);
        
        // Add real alphagrams
        for (const [alphagram, words] of availableAlphagrams) {
            alphagrams.push({
                alphagram: alphagram.toUpperCase(),
                validWords: [...new Set(words)], // Remove duplicates using Set
                isFake: false,
                length: length
            });
        }
        
        // Add fake alphagrams for this length
        for (let i = 0; i < fakeCount; i++) {
            const fakeAlphagram = generateFakeAlphagram(length);
            alphagrams.push({
                alphagram: fakeAlphagram,
                validWords: [],
                isFake: true,
                length: length
            });
        }
    }
    
    // Shuffle the final alphagrams
    return alphagrams.sort(() => Math.random() - 0.5);
}

// Initialize the alphagram maps when this module loads
initializeAlphagramMaps();

// Export the public API
export {
    DICTIONARIES,
    DICTIONARY_SETS,
    ALPHAGRAM_MAPS,
    DICTIONARY_2,
    DICTIONARY_3,
    DICTIONARY_4,
    createAlphagram,
    isValidWord,
    getValidAnagrams,
    getRandomWord,
    generateFakeAlphagram,
    generateGame,
    initializeAlphagramMaps
};
