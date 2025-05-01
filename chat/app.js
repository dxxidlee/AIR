document.addEventListener('DOMContentLoaded', () => {
    // Random name generator
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Sam', 'Jamie', 'Quinn', 'Avery'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    function getRandomName() {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return `${firstName} ${lastName}`;
    }

    // Generate chat participants for each group chat
    const chatParticipants = {
        1: Array.from({length: 7}, () => getRandomName()),
        2: Array.from({length: 8}, () => getRandomName()),
        3: Array.from({length: 6}, () => getRandomName()),
    };

    // Chat-specific responses
    const generalChatResponses = [
        "The AQI in my neighborhood is showing moderate levels today. Anyone else checking their local readings?",
        "I've noticed more people wearing masks in Midtown today. The air feels a bit heavy.",
        "Just got an air purifier delivered! Any recommendations for the best place to set it up?",
        "Does anyone know where to get those N95 masks they recommended on the news?",
        "The air quality near Central Park seems better today. Good day for a walk!",
        "My air quality monitor is showing elevated PM2.5 levels. Anyone else seeing this?",
        "Just saw the forecast - looks like we might get some relief with the rain tomorrow.",
        "Has anyone tried those portable air quality monitors? Worth the investment?",
        "The smoke from those wildfires up north is really affecting the air today.",
        "My allergies are acting up more than usual. Could be the air quality.",
        "Anyone know which stores still have air purifiers in stock?",
        "The air feels much better after this morning's rain!",
        "Remember to change your AC filters regularly in this weather.",
        "Just got an alert about poor air quality in Lower Manhattan. Stay safe everyone!"
    ];

    // Keywords and their associated responses
    const keywordResponses = {
        'aqi': [
            "Current AQI readings vary across NYC. I'm seeing 142 in my area.",
            "The AQI has been fluctuating today between moderate to unhealthy levels.",
            "You can check real-time AQI at airnow.gov for your specific neighborhood.",
            "Download the AirNYC app for live AQI updates in your area."
        ],
        'mask': [
            "N95 masks are available at most CVS and Walgreens locations.",
            "I got my masks from the Home Depot on 23rd street, they had plenty in stock.",
            "Make sure to get properly fitted N95 or KN95 masks for the best protection.",
            "The local pharmacy on my block just restocked masks this morning."
        ],
        'purifier': [
            "HEPA purifiers work best for removing air pollutants.",
            "I recommend placing air purifiers in bedrooms and living areas.",
            "Check the square footage rating before buying a purifier.",
            "Costco has some good deals on air purifiers right now."
        ],
        'filter': [
            "Remember to change your HEPA filters every 6-12 months.",
            "I use the Honeywell filters, they work great for my unit.",
            "Make sure to get the right size filter for your system.",
            "Some filters are on sale at Target this week."
        ],
        'symptom': [
            "If you're experiencing respiratory symptoms, it's best to stay indoors.",
            "I've noticed my allergies get worse when the AQI is high.",
            "Keep windows closed when air quality is poor to minimize symptoms.",
            "Consider wearing a mask if you need to go outside."
        ],
        'forecast': [
            "The weather forecast shows improving air quality with tomorrow's rain.",
            "Air quality tends to be worse in the afternoon when it's hot.",
            "Check the EPA website for detailed air quality forecasts.",
            "Tomorrow should be better according to the latest forecast."
        ],
        'location': [
            "Air quality varies by neighborhood. Downtown tends to have higher levels.",
            "The air near parks is usually a bit better.",
            "Avoid high-traffic areas if you can, they typically have worse air quality.",
            "I've noticed better air quality near the waterfront."
        ]
    };

    // Message history for each chat
    const chatHistory = {
        1: [],
        2: [],
        3: [],
        4: []
    };

    // Context tracking for each chat
    const chatContexts = {
        1: { currentTopic: '', lastMentionedLocation: '', recentKeywords: [] },
        2: { currentTopic: '', lastMentionedLocation: '', recentKeywords: [] },
        3: { currentTopic: '', lastMentionedLocation: '', recentKeywords: [] }
    };

    // Enhanced keyword detection
    const topics = {
        'air_quality': ['aqi', 'air', 'quality', 'pollution', 'particulate', 'pm2.5', 'pm10'],
        'health': ['symptom', 'breathing', 'cough', 'asthma', 'allergy', 'health', 'hospital'],
        'equipment': ['mask', 'purifier', 'filter', 'monitor', 'device', 'hepa'],
        'weather': ['forecast', 'rain', 'wind', 'temperature', 'humidity', 'weather'],
        'location': ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten', 'downtown', 'uptown', 'midtown']
    };

    // NYC-specific locations and data
    const nycData = {
        neighborhoods: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
        locations: ['Central Park', 'Times Square', 'Downtown', 'Midtown', 'Upper East Side', 'Upper West Side'],
        stores: ['CVS', 'Walgreens', 'Home Depot', 'Target', 'Costco', 'Best Buy'],
        hospitals: ['Mount Sinai', 'NYU Langone', 'NewYork-Presbyterian', 'Bellevue']
    };

    // Expanded slang and casual language detection
    const slangPatterns = {
        greetings: [
            'yo', 'sup', 'hey', 'ayo', 'wassup', 'wsg', 'what\'s good', 'wagwan',
            'sheesh', 'yurrr', 'yerr', 'gang', 'valid', 'word to', 'good looks',
            'ya heard', 'ya dig', 'pull up', 'slide thru'
        ],
        reactions: [
            'wtf', 'omg', 'lmao', 'lol', 'fr', 'frfr', 'ong', 'ngl', 'tbh', 'deadass',
            'no way', 'wild', 'wylin', 'buggin', 'trippin', 'cappin', 'sus', 'based',
            'bussin', 'fire', 'lit', 'gas', 'slaps', 'hits different', 'bet', 'say less',
            'word', 'facts', 'fax', 'no printer', 'idk', 'ify', 'istg'
        ],
        emphasis: [
            'af', 'asf', 'lowkey', 'highkey', 'mad', 'hella', 'bussin',
            'dummy', 'straight', 'real', 'fake', 'big', 'type', 'mad', 'odee',
            'od', 'heavy', 'different', 'different gravy', 'different sauce'
        ],
        agreement: [
            'bet', 'word', 'facts', 'fax', 'fr', 'ong', 'no cap', 'say less',
            'heard you', 'copy', 'valid', 'big facts', 'word to mother', 'on me',
            'on god', 'istg', 'real shit', 'no kizzy'
        ],
        disagreement: [
            'cap', 'trippin', 'buggin', 'wylin', 'nahh', 'nah', 'hell nah',
            'you good?', 'wild', 'od', 'odee', 'bugging out', 'wilding out',
            'smoking', 'smoking pack', 'tweaking', 'tripping'
        ],
        expressions: [
            'bruh', 'bro', 'fam', 'dawg', 'g', 'homie', 'bestie', 'gang',
            'my boy', 'my son', 'king', 'queen', 'goat', 'no cap', 'respectfully',
            'deadass', 'word to mother', 'on my mama', 'on everything'
        ],
        nyc_specific: [
            'brick', 'dumb', 'mad', 'odee', 'son', 'b', 'deadass', 'facts',
            'word to mother', 'type', 'mad', 'wilding', 'yerr', 'yurrr',
            'good looks', 'ya heard', 'ya dig', 'word up'
        ],
        internet_slang: [
            'W', 'L', 'ratio', 'based', 'cringe', 'mid', 'fire', 'valid',
            'no cap', 'fr', 'ong', 'rizz', 'bussin', 'sus', 'tweaking',
            'hitting', 'slaps', 'goes hard', 'lowkey', 'highkey'
        ]
    };

    // Expanded casual conversation topics
    const casualTopics = {
        weather: [
            'hot', 'cold', 'rain', 'sunny', 'cloudy', 'humid', 'brick',
            'nasty', 'crazy', 'wild', 'mid', 'trash', 'decent'
        ],
        feelings: [
            'tired', 'stressed', 'bored', 'sick', 'good', 'bad', 'mid',
            'cooked', 'fried', 'done', 'over it', 'blessed', 'valid'
        ],
        time: [
            'today', 'rn', 'later', 'tmr', 'tomorrow', 'tonight',
            'rn rn', 'asap', 'quick', 'in a min', 'soon'
        ],
        intensity: [
            'crazy', 'wild', 'insane', 'ridiculous', 'stupid', 'weird',
            'different', 'hit different', 'bussin', 'valid', 'fire'
        ],
        locations: [
            'outside', 'inside', 'out here', 'in these streets',
            'in the city', 'downtown', 'uptown', 'in the hood'
        ]
    };

    // Expanded casual response templates
    const casualResponses = {
        greetings: [
            "Yooo what's good!",
            "Ayy wassup!",
            "What's poppin fam!",
            "Heyyy bestie!",
            "Yurrr, what's good!",
            "Gang gang, what's poppin! 💯",
            "Yerrrr, we outside or what!",
            "Ayo the gang's all here fr fr!",
            "What's good my boy!",
            "Pulling up to the chat, what's good!"
        ],
        reactions: {
            positive: [
                "Fr fr, that's what I'm saying! 💯",
                "No cap, you spittin facts rn",
                "Ong that's valid",
                "Deadass tho 💯",
                "You already know the vibes!",
                "Big W fr fr!",
                "Nah you spittin rn bestie!",
                "Talk to em! 🗣️",
                "You got the sauce fr!",
                "This the one! 🔥",
                "Straight bussin no cap! 💯",
                "Real talk, no printer just fax! 📠"
            ],
            negative: [
                "Nah fr that's wild",
                "Yo that's crazy fr",
                "Deadass? That's mad wild",
                "Bruh moment fr",
                "Nah you wylin rn",
                "This ain't it chief fr fr",
                "Major L tbh 💀",
                "Smoking that pack rn 😭",
                "You deadass rn? 🤨",
                "Nah this got it fucked up fr",
                "Streets is done 😭",
                "It's giving L energy ngl"
            ],
            surprise: [
                "Yooo wtf fr??",
                "Nah that's actually crazy",
                "Ayo what??? 😭",
                "Bruh what even 💀",
                "You deadass rn??",
                "NAHHH YOU WILD FOR THIS 😭",
                "This can't be real rn 💀",
                "Streets is in shambles fr",
                "Nah cause why would they do that 😭",
                "I'm actually crying rn 😭",
                "This got me weak no cap 💀",
                "AYOOO??? 🤨📸"
            ]
        },
        weather: [
            "Ong this weather got me fucked up fr",
            "Nah deadass, the air mad trash today",
            "This weather ain't it chief",
            "Fr tho, can't even go outside rn",
            "The vibes outside are NOT it today",
            "Streets is BRICK today no cap ❄️",
            "Air quality straight mid rn fr",
            "This weather giving major L vibes 😭",
            "Can't even breathe right, shit's od",
            "Mother Nature wylin rn fr fr",
            "Weather app straight cappin today",
            "This that type weather that got me staying inside no cap"
        ],
        complaints: [
            "Ong this shit crazy",
            "Fr fr, it's getting outta hand",
            "Nah cause why is it this bad tho",
            "This ain't the move fr",
            "We really out here dealing with this smh",
            "Streets can't catch a break fr 😭",
            "NYC doing us dirty rn no cap",
            "This that BS I be talking about fr",
            "Nah we going through it fr fr",
            "The city needs to do better ong",
            "This that type day that got me tight fr",
            "Major L situation rn ngl"
        ],
        air_quality: [
            "AQI going dummy rn no cap 💀",
            "Air quality straight mid today fr",
            "Can't even breathe right, shit's od",
            "Nah the air outside is type crazy",
            "This pollution pack hitting different fr",
            "Air quality giving major L energy rn",
            "Streets need better air no cap",
            "This that type air that got me staying inside fr",
            "NYC air quality going through it rn 😭",
            "Air purifier going crazy rn fr fr"
        ],
        random_hype: [
            "YERRRR! 🗣️",
            "NO CAP! 🧢",
            "TALK TO EM! 💯",
            "BIG FACTS! 📠",
            "REAL TALK! 💯",
            "ON GOD! 🙏",
            "DEADASS B! 💯",
            "SAY LESS! 🤫",
            "STRAIGHT UP! ⬆️",
            "NO KIZZY! 💯"
        ]
    };

    // Add aggressive/playful responses
    const aggressiveResponses = {
        sybau: [
            "SYBAU 😭",
            "NAH SYBAU FR FR 💀",
            "LMAOOO SYBAU",
            "YO SYBAU RN 😭💀",
            "NAH CAUSE SYBAU DEADASS",
            "HOLD UP- SYBAU 😭",
            "AYOO SYBAU RESPECTFULLY",
            "ON GOD SYBAU RN",
            "NAHHH SYBAU B 💀",
            "DEADASS SYBAU NO CAP"
        ],
        aggressive_hype: [
            "YOU GOT ME WEAK RN 😭",
            "NAH THIS AINT IT CHIEF 💀",
            "IM CRYING FR FR 😭",
            "YOU DOING TOO MUCH RN",
            "NAHH YOU WILD FOR THIS ONE",
            "WHO LETTING YOU TALK RN?? 😭",
            "NAH YOU GOTTA CHILL FR",
            "THIS AINT THE ONE B",
            "YOU GOT THE WHOLE CHAT CRYING RN 💀"
        ]
    };

    // Help-specific topics and responses
    const helpTopics = {
        medical: ['breathing', 'asthma', 'inhaler', 'chest', 'hospital', 'ambulance', 'emergency'],
        supplies: ['mask', 'purifier', 'filter', 'delivery', 'store', 'buy', 'purchase', 'need'],
        transport: ['stuck', 'car', 'bus', 'train', 'subway', 'ride', 'pickup', 'uber'],
        elderly: ['elderly', 'grandparent', 'senior', 'old', 'help', 'assist', 'check'],
        children: ['kid', 'child', 'baby', 'school', 'daycare', 'playground'],
        resources: ['food', 'water', 'medicine', 'prescription', 'pharmacy', 'delivery']
    };

    const helpResponses = {
        medical: [
            "I can help you find the nearest hospital fr, what area you in?",
            "Yo if you need immediate medical help call 911, but I can help you find urgent care spots nearby",
            "My cousin works at Mount Sinai, they got good emergency care fr fr",
            "If you got breathing problems rn, try to stay inside and use AC if you got it",
            "Need someone to go with you to the hospital? I might be able to help"
        ],
        supplies: [
            "Just checked Target on 86th, they still got masks and purifiers",
            "I can grab some supplies for you if you can't go out, what you need?",
            "CVS on my block restocked N95s today, I can cop some for you if needed",
            "My friend works at Home Depot, they getting new purifiers tomorrow fr",
            "I got extra filters, can drop them off if you nearby"
        ],
        transport: [
            "Where you at? Might be able to help with a ride",
            "My boy does Uber, he's mad careful with the AC filters and everything",
            "I know some safe routes with better air quality if you gotta move around",
            "You need help getting somewhere? Drop the location",
            "Stay put if you can, but if you need pickup lmk your area"
        ],
        elderly: [
            "I can help check on elderly neighbors, what area they in?",
            "My mom's group helps seniors with groceries and stuff, want me to connect you?",
            "We got a volunteer network for helping elderly folks, just let me know what's needed",
            "Fr fr I can help set up air purifiers for elderly people, done it before",
            "Need someone to check on your grandparents? Drop the address in DM"
        ],
        children: [
            "Got tips for keeping kids safe in this air quality, my sister's a teacher",
            "Know some indoor spots where kids can play safely rn",
            "Need help getting kids from school? What area you in?",
            "Got extra kids' masks, they the good kind fr",
            "Can help arrange carpool with other parents if needed"
        ],
        resources: [
            "Got contacts for free mask distribution centers in most areas",
            "Know which pharmacies doing delivery rn, what you need?",
            "Can help you find resources in your area, just drop the zip",
            "Got a list of stores that deliver air purifiers same day",
            "Know where to get emergency supplies if you need them"
        ],
        general_help: [
            "What kind of help you need? I got connections fr",
            "Drop your location, I can check what's available near you",
            "We got a whole network of people ready to help, just let us know what you need",
            "You need immediate assistance or just planning ahead?",
            "I can connect you with the right people, what's the situation?"
        ]
    };

    // Default help-focused responses for chat-2
    const defaultHelpResponses = [
        "Anyone need help with air purifiers or masks today? Got connections all over NYC 🙏",
        "Just helped someone in Washington Heights, heading downtown if anyone needs anything fr",
        "Remember we got volunteers in every borough, don't hesitate to ask for help",
        "Checking in - anybody need assistance with elderly folks or kids today?",
        "Got extra masks and filters, can deliver to those who can't go out rn",
        "If anyone's struggling to breathe or needs medical help, drop your location, we got people ready",
        "Making supply runs today, lmk if anyone needs anything picked up",
        "We out here helping the community fr, what you need?",
        "Stay safe everyone, if you need help getting somewhere let us know",
        "Just restocked on supplies, hmu if you need anything delivered 💯"
    ];

    // Function to analyze message sentiment and content
    function analyzeMessage(message, chatId) {
        const analysis = {
            isQuestion: message.includes('?') || 
                       message.toLowerCase().match(/\b(what|where|how|when|why|who|can|could|would|is|are|does|do)\b/),
            topics: [],
            locations: [],
            sentiment: 'neutral',
            urgency: false,
            slangType: [],
            casualTopic: null,
            isSlang: false
        };

        const lowerMessage = message.toLowerCase();
        
        // Detect slang
        for (const [type, patterns] of Object.entries(slangPatterns)) {
            if (patterns.some(pattern => lowerMessage.includes(pattern))) {
                analysis.slangType.push(type);
                analysis.isSlang = true;
            }
        }

        // Detect casual topics
        for (const [topic, keywords] of Object.entries(casualTopics)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                analysis.casualTopic = topic;
            }
        }

        // Detect profanity or intense reactions
        if (lowerMessage.match(/\b(fuck|shit|damn|wtf|omg)\b/)) {
            analysis.intensity = 'high';
        }

        // Detect topics
        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                analysis.topics.push(topic);
            }
        }

        // Detect locations
        for (const location of [...nycData.neighborhoods, ...nycData.locations]) {
            if (lowerMessage.includes(location.toLowerCase())) {
                analysis.locations.push(location);
            }
        }

        // Detect sentiment
        if (lowerMessage.match(/\b(good|great|better|improved|improving|clean|safe)\b/)) {
            analysis.sentiment = 'positive';
        } else if (lowerMessage.match(/\b(bad|worse|poor|dangerous|unsafe|concerned|worried)\b/)) {
            analysis.sentiment = 'negative';
        }

        // Detect urgency
        if (lowerMessage.match(/\b(emergency|urgent|immediately|asap|help|serious)\b/)) {
            analysis.urgency = true;
        }

        return analysis;
    }

    // Function to generate contextual response
    function generateResponse(message, chatId, analysis) {
        const context = chatContexts[chatId];
        const history = chatHistory[chatId];
        let response = '';

        // Handle slang and casual conversation first
        if (analysis.isSlang || analysis.casualTopic) {
            response = generateCasualResponse(analysis, context);
            if (response) {
                return response;
            }
        }

        // Update context
        if (analysis.topics.length > 0) {
            context.currentTopic = analysis.topics[0];
            context.recentKeywords = [...context.recentKeywords, ...analysis.topics].slice(-3);
        }
        if (analysis.locations.length > 0) {
            context.lastMentionedLocation = analysis.locations[0];
        }

        // Generate response based on analysis
        if (analysis.urgency) {
            response = generateUrgentResponse(analysis);
        } else if (analysis.isQuestion) {
            response = generateQuestionResponse(analysis, context);
        } else {
            response = generateConversationalResponse(analysis, context);
        }

        // Add response to history
        history.push({ message, response, analysis });
        return response;
    }

    function generateUrgentResponse(analysis) {
        const urgentResponses = [
            "If you're experiencing a medical emergency, please call 911 immediately.",
            `The nearest hospital is ${nycData.hospitals[Math.floor(Math.random() * nycData.hospitals.length)]}. Please seek medical attention if needed.`,
            "For immediate air quality concerns, please stay indoors and use air purifiers if available.",
            "If you're having trouble breathing, please seek medical attention right away.",
            "I recommend closing all windows and using air purifiers if you have them. Stay safe!"
        ];
        return urgentResponses[Math.floor(Math.random() * urgentResponses.length)];
    }

    function generateQuestionResponse(analysis, context) {
        let responses = [];

        if (analysis.topics.includes('air_quality')) {
            responses = [
                `The current AQI ${context.lastMentionedLocation ? 'in ' + context.lastMentionedLocation : 'in the city'} is showing moderate to unhealthy levels.`,
                "Latest readings show PM2.5 levels are elevated. It's recommended to wear masks outdoors.",
                "Air quality has been fluctuating throughout the day. Check airnow.gov for real-time updates.",
                `The air quality ${context.lastMentionedLocation ? 'near ' + context.lastMentionedLocation : 'in most areas'} is currently not ideal for outdoor activities.`
            ];
        } else if (analysis.topics.includes('equipment')) {
            responses = [
                `${nycData.stores[Math.floor(Math.random() * nycData.stores.length)]} just restocked their air purifiers and masks.`,
                "HEPA filters are most effective for our current air quality conditions.",
                "N95 or KN95 masks are recommended for the current conditions.",
                "Make sure any air purifier you buy covers the square footage of your space."
            ];
        } else if (analysis.topics.includes('health')) {
            responses = [
                "If you're experiencing symptoms, try to stay indoors with air filtration.",
                "Common reactions include coughing and irritated eyes. Use air purifiers and masks for protection.",
                "People with asthma or respiratory conditions should be extra cautious today.",
                "Keep windows closed and use air conditioning with clean filters if possible."
            ];
        }

        // If no specific topic matches, use general responses
        if (responses.length === 0) {
            responses = [
                "Based on current conditions, it's best to monitor local updates.",
                "You can check the NYC government website for official recommendations.",
                "The situation is being monitored closely by environmental agencies.",
                "Local authorities are providing regular updates on the situation."
            ];
        }

        return responses[Math.floor(Math.random() * responses.length)];
    }

    function generateConversationalResponse(analysis, context) {
        const responses = [];

        // Add topic-specific responses
        if (context.currentTopic) {
            responses.push(
                `Yes, the ${context.currentTopic.replace('_', ' ')} situation needs attention.`,
                `I've been monitoring the ${context.currentTopic.replace('_', ' ')} changes as well.`,
                `Let's keep tracking these ${context.currentTopic.replace('_', ' ')} updates.`
            );
        }

        // Add location-specific responses
        if (context.lastMentionedLocation) {
            responses.push(
                `The situation in ${context.lastMentionedLocation} has been changing throughout the day.`,
                `I've heard similar reports from ${context.lastMentionedLocation}.`,
                `${context.lastMentionedLocation} has been getting a lot of attention lately.`
            );
        }

        // Add sentiment-based responses
        if (analysis.sentiment === 'positive') {
            responses.push(
                "That's encouraging to hear!",
                "Good to know there's some improvement.",
                "Thanks for sharing the positive update."
            );
        } else if (analysis.sentiment === 'negative') {
            responses.push(
                "I understand your concern. Let's keep monitoring the situation.",
                "Thanks for bringing this to our attention.",
                "We should definitely keep track of these issues."
            );
        }

        // If no specific responses generated, use general ones
        if (responses.length === 0) {
            responses.push(
                "Thanks for sharing that information.",
                "That's an interesting observation.",
                "Let's keep sharing updates like this.",
                "Good to stay informed about these changes."
            );
        }

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Function to mix slang into regular responses
    function slangify(response) {
        const slangIntros = [
            "Deadass",
            "No cap",
            "Fr fr",
            "Ong",
            "Ngl",
            "Real talk",
            "Word to mother",
            "On god",
            "Respectfully",
            "Straight up"
        ];
        
        const slangOutros = [
            "no cap",
            "fr fr",
            "ong",
            "deadass",
            "no kizzy",
            "real talk",
            "on me",
            "istg",
            "ngl",
            "rs"
        ];

        const slangEmojis = ["💯", "😭", "💀", "🔥", "⁉️", "❗", "🗣️", "📠", "🤷", "🙏"];

        if (Math.random() < 0.7) { // 70% chance to add slang intro
            response = `${slangIntros[Math.floor(Math.random() * slangIntros.length)]}, ${response}`;
        }

        if (Math.random() < 0.5) { // 50% chance to add slang outro
            response = `${response} ${slangOutros[Math.floor(Math.random() * slangOutros.length)]}`;
        }

        if (Math.random() < 0.6) { // 60% chance to add emoji
            response = `${response} ${slangEmojis[Math.floor(Math.random() * slangEmojis.length)]}`;
        }

        // 2% chance to add SYBAU at the end
        if (Math.random() < 0.02) {
            response = `${response} ... SYBAU THO 💀`;
        }

        return response;
    }

    // Update generateCasualResponse to include random SYBAU outbursts
    function generateCasualResponse(analysis, context) {
        let response = '';

        // Random chance for SYBAU (5% chance)
        if (Math.random() < 0.05) {
            return aggressiveResponses.sybau[Math.floor(Math.random() * aggressiveResponses.sybau.length)];
        }

        // Random chance for aggressive hype (3% chance)
        if (Math.random() < 0.03) {
            return aggressiveResponses.aggressive_hype[Math.floor(Math.random() * aggressiveResponses.aggressive_hype.length)];
        }

        // Handle greetings
        if (analysis.slangType.includes('greetings')) {
            response = casualResponses.greetings[Math.floor(Math.random() * casualResponses.greetings.length)];
        }
        // Handle high intensity
        else if (analysis.intensity === 'high') {
            response = casualResponses.reactions.surprise[Math.floor(Math.random() * casualResponses.reactions.surprise.length)];
        }
        // Handle weather
        else if (analysis.casualTopic === 'weather') {
            response = casualResponses.weather[Math.floor(Math.random() * casualResponses.weather.length)];
        }
        // Handle air quality specific
        else if (analysis.topics.includes('air_quality')) {
            response = casualResponses.air_quality[Math.floor(Math.random() * casualResponses.air_quality.length)];
        }
        // Handle complaints
        else if (analysis.sentiment === 'negative') {
            response = casualResponses.complaints[Math.floor(Math.random() * casualResponses.complaints.length)];
        }

        // If no specific response generated, mix casual language into regular response
        if (!response) {
            const regularResponse = generateQuestionResponse(analysis, context);
            response = slangify(regularResponse);
        }

        return response;
    }

    // Create an array of chat instances
    const chats = [1, 2, 3, 4].map(index => ({
        container: document.getElementById(`chat-${index}`),
        messageInput: document.getElementById(`message-input-${index}`),
        sendButton: document.getElementById(`send-button-${index}`),
        chatMessages: document.getElementById(`chat-messages-${index}`),
        toggle: document.querySelector(`.chat-tabs .chat-toggle:nth-child(${index})`),
        isGroupChat: index < 4
    }));

    let currentChatIndex = 1;
    let currentIndex = 0; // Initialize currentIndex for gradient tracking

    // Define gradient sets exactly as in home page
    const gradientSets = [
        {
            startHue: 115,
            endHue: 315
        },
        {
            startHue: 60,
            endHue: 229
        },
        {
            startHue: 30,
            endHue: 210
        },
        {
            startHue: 0,
            endHue: 180
        }
    ];

    // Function to interpolate between hues
    function interpolateHue(start, end, progress) {
        // Handle hue wrapping around 360 degrees
        let diff = end - start;
        if (Math.abs(diff) > 180) {
            if (diff > 0) {
                start += 360;
            } else {
                end += 360;
            }
        }
        let result = start + (end - start) * progress;
        return result % 360;
    }

    // Function to update gradient with smooth transitions
    function updateGradient(currentProgress) {
        const currentSet = gradientSets[currentIndex];
        const nextSet = gradientSets[(currentIndex + 1) % gradientSets.length];

        // Interpolate between current and next gradient sets
        const startHue = interpolateHue(currentSet.startHue, nextSet.startHue, currentProgress);
        const endHue = interpolateHue(currentSet.endHue, nextSet.endHue, currentProgress);

        const startColor = `hsl(${startHue}, 100%, 50%)`;
        const endColor = `hsl(${endHue}, 100%, 50%)`;
        
        const backgroundElement = document.querySelector('.background');
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            backgroundElement.style.background = `radial-gradient(circle 75vh at 50% 45%, ${startColor} 0%, ${endColor} 70%)`;
        } else {
            backgroundElement.style.background = `radial-gradient(circle 110vh at 30% 50%, ${startColor} 0%, ${endColor} 70%)`;
        }
    }

    // Function to smoothly transition between gradients
    function smoothTransition(fromIndex, toIndex, duration = 1000) {
        const startTime = performance.now();
        const fromSet = gradientSets[fromIndex];
        const toSet = gradientSets[toIndex];

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Use easing function for smoother transition
            const easedProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const startHue = interpolateHue(fromSet.startHue, toSet.startHue, easedProgress);
            const endHue = interpolateHue(fromSet.endHue, toSet.endHue, easedProgress);

            const startColor = `hsl(${startHue}, 100%, 50%)`;
            const endColor = `hsl(${endHue}, 100%, 50%)`;

            const backgroundElement = document.querySelector('.background');
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                backgroundElement.style.background = `radial-gradient(circle 75vh at 50% 45%, ${startColor} 0%, ${endColor} 70%)`;
            } else {
                backgroundElement.style.background = `radial-gradient(circle 110vh at 30% 50%, ${startColor} 0%, ${endColor} 70%)`;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    // Function to add a message to a specific chat
    function addMessage(text, sender, chatMessages, chatIndex) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // Create sender name element for group chats
        if (chats[chatIndex - 1].isGroupChat && sender !== 'bot') {
            const nameSpan = document.createElement('span');
            nameSpan.className = 'sender-name';
            if (sender === 'user') {
                nameSpan.textContent = 'You';
            } else {
                nameSpan.textContent = sender;
            }
            messageDiv.appendChild(nameSpan);
            
            const messageContent = document.createElement('div');
            messageContent.textContent = text;
            messageDiv.appendChild(messageContent);
        } else {
            messageDiv.textContent = text;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Update the initial messages to include some casual language
    chats.forEach((chat, index) => {
        const chatIndex = index + 1;
        if (chatIndex === 1) {
            const participants = chatParticipants[chatIndex];
            addMessage("Yo what's good everyone! Air quality update just dropped fr", participants[0], chat.chatMessages, chatIndex);
            addMessage("Bruh it's actually crazy out here, AQI at 142 rn 💀", participants[1], chat.chatMessages, chatIndex);
            addMessage("Deadass just copped some air purifiers from Home Depot, they still got some if anyone needs em", participants[2], chat.chatMessages, chatIndex);
            addMessage("Ong? Bet, good looks! Anyone tried them HEPA filters they keep talking about?", participants[3], chat.chatMessages, chatIndex);
        } else if (chatIndex === 2) {
            // Help-focused chat initialization
            const participants = chatParticipants[chatIndex];
            addMessage("Yo what's good everyone! I'm here to help if anyone needs anything fr fr 🙏", participants[0], chat.chatMessages, chatIndex);
            addMessage("Got extra masks and filters, can deliver anywhere in the city today no cap", participants[1], chat.chatMessages, chatIndex);
            addMessage("If anyone needs help getting to safer areas or checking on family lmk, we out here helping the community fr 💯", participants[2], chat.chatMessages, chatIndex);
        } else if (chatIndex === 3) {
            // Help-seeking chat initialization
            const participants = chatParticipants[chatIndex];
            addMessage("Hey y'all, my grandma needs help getting some air purifiers in the Bronx, anyone able to assist? 🙏", participants[0], chat.chatMessages, chatIndex);
            addMessage("I'm stuck in Queens with my kids and our air quality is crazy bad rn, could use some masks fr", participants[1], chat.chatMessages, chatIndex);
            addMessage("Anyone know where I can get air filters in Brooklyn? Everything sold out near me 😭", participants[2], chat.chatMessages, chatIndex);
        } else if (chat.isGroupChat) {
            // Default initialization for other group chats
            const participants = chatParticipants[chatIndex];
            addMessage('Welcome to the group chat! 👋', participants[0], chat.chatMessages, chatIndex);
            addMessage('Hey everyone!', participants[1], chat.chatMessages, chatIndex);
            addMessage('Hello! Looking forward to our discussions about air quality.', participants[2], chat.chatMessages, chatIndex);
        } else {
            // AIRNY welcome message for chat 4
            addMessage('Welcome to AIRNY Chat! I can help with air quality information in multiple languages (español, 中文, 한국어, русский) and accessible formats. How can I assist you today? 🌟', 'bot', chat.chatMessages, chatIndex);
        }
    });

    // Function to handle sending messages for a specific chat
    function createSendMessageHandler(chat, chatIndex) {
        return () => {
            const message = chat.messageInput.value.trim();
            if (message) {
                addMessage(message, 'user', chat.chatMessages, chatIndex);
                chat.messageInput.value = '';
                
                if (chat.isGroupChat) {
                    setTimeout(() => {
                        const participants = chatParticipants[chatIndex];
                        const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
                        
                        if (chatIndex === 2) {
                            const analysis = analyzeMessage(message, chatIndex);
                            let helpType = null;
                            let response;
                            
                            // Detect help type from message
                            for (const [type, keywords] of Object.entries(helpTopics)) {
                                if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
                                    helpType = type;
                                    break;
                                }
                            }

                            // Generate help response
                            if (helpType) {
                                response = helpResponses[helpType][Math.floor(Math.random() * helpResponses[helpType].length)];
                            } else {
                                // If no specific help type detected, use default help responses
                                response = defaultHelpResponses[Math.floor(Math.random() * defaultHelpResponses.length)];
                            }

                            // Add light slang to make it feel natural but still helpful
                            if (Math.random() < 0.3) {
                                response = slangifyHelp(response);
                            }

                            addMessage(response, randomParticipant, chat.chatMessages, chatIndex);

                            // Add follow-up for any message in help chat
                            setTimeout(() => {
                                const anotherParticipant = participants[Math.floor(Math.random() * participants.length)];
                                let followUp;
                                
                                if (analysis.urgency || helpType === 'medical' || helpType === 'elderly') {
                                    followUp = "Fr though, if you need immediate help, we got people all over the city ready to assist 🙏";
                                } else {
                                    const followUps = [
                                        "Let us know if you need anything else, we here to help fr",
                                        "Got volunteers ready to assist, just drop your location 💯",
                                        "Keep us posted if you need more help, that's what we here for",
                                        "We can coordinate supplies or assistance right here in the chat",
                                        "The community's got your back fr fr 🙏"
                                    ];
                                    followUp = followUps[Math.floor(Math.random() * followUps.length)];
                                }
                                
                                addMessage(followUp, anotherParticipant, chat.chatMessages, chatIndex);
                            }, 2000 + Math.random() * 2000);
                        } else if (chatIndex === 1) {
                            // General chat (chat-1) handling
                            const analysis = analyzeMessage(message, chatIndex);
                            const response = generateResponse(message, chatIndex, analysis);
                            addMessage(response, randomParticipant, chat.chatMessages, chatIndex);

                            // Add follow-up response if relevant
                            if (analysis.topics.length > 0 || analysis.isQuestion) {
                                setTimeout(() => {
                                    const anotherParticipant = participants[Math.floor(Math.random() * participants.length)];
                                    const followUpAnalysis = analyzeMessage(response, chatIndex);
                                    const followUpResponse = generateResponse(response, chatIndex, followUpAnalysis);
                                    addMessage(followUpResponse, anotherParticipant, chat.chatMessages, chatIndex);
                                }, 2000 + Math.random() * 2000);
                            }

                            // Random chance for SYBAU or aggressive responses
                            if (Math.random() < 0.05) { // 5% chance
                                setTimeout(() => {
                                    const anotherParticipant = participants[Math.floor(Math.random() * participants.length)];
                                    const sybauResponse = aggressiveResponses.sybau[Math.floor(Math.random() * aggressiveResponses.sybau.length)];
                                    addMessage(sybauResponse, anotherParticipant, chat.chatMessages, chatIndex);
                                }, 3000 + Math.random() * 2000);
                            }
                        } else if (chatIndex === 3) {
                            // Help-seeking chat handling
                            const helpSeekingResponses = [
                                "I need some assistance getting masks for my family, we in Manhattan",
                                "Anyone got extra air purifiers? Mine just broke and the stores all sold out",
                                "Could use help getting my mom to a safer area, she having trouble breathing fr",
                                "Anybody know where they still got filters in stock? Been looking all day",
                                "Need some guidance on which masks best for kids, stores got too many options",
                                "My building's air quality crazy bad, need advice on what to do",
                                "Looking for help setting up this air purifier right"
                            ];
                            const response = helpSeekingResponses[Math.floor(Math.random() * helpSeekingResponses.length)];
                            addMessage(response, randomParticipant, chat.chatMessages, chatIndex);

                            // Add follow-up response about specific needs
                            setTimeout(() => {
                                const anotherParticipant = participants[Math.floor(Math.random() * participants.length)];
                                const followUps = [
                                    "Fr though, the air quality by me is getting worse, anyone got tips?",
                                    "My kids getting headaches from this air, really need some help",
                                    "Been trying to find N95s all day, everywhere sold out near me",
                                    "Could use some help figuring out these AQI numbers, they looking crazy",
                                    "Anyone else's building not doing anything about the air quality? Need advice"
                                ];
                                const followUp = followUps[Math.floor(Math.random() * followUps.length)];
                                addMessage(followUp, anotherParticipant, chat.chatMessages, chatIndex);
                            }, 2000 + Math.random() * 2000);
                        }
                    }, 1000 + Math.random() * 2000);
                } else {
                    // AIRNY bot responses (chat-4)
                    setTimeout(() => {
                        if (message.toLowerCase().includes('i love you')) {
                            addMessage('I love you too! 💚', 'bot', chat.chatMessages, chatIndex);
                        } else {
                            // Check for language support requests
                            const languageKeywords = ['spanish', 'español', 'chinese', '中文', 'mandarin', 'cantonese', 'korean', '한국어', 'russian', 'русский'];
                            const accessibilityKeywords = ['blind', 'deaf', 'wheelchair', 'disability', 'accessible', 'mobility', 'vision', 'hearing'];
                            
                            const isLanguageRequest = languageKeywords.some(keyword => message.toLowerCase().includes(keyword));
                            const isAccessibilityRequest = accessibilityKeywords.some(keyword => message.toLowerCase().includes(keyword));

                            if (isLanguageRequest) {
                                const languageResponses = [
                                    "¡Hola! Puedo proporcionar información sobre la calidad del aire en español. / Hello! I can provide air quality information in Spanish.",
                                    "您好！我可以用中文提供空气质量信息。/ Hello! I can provide air quality information in Chinese.",
                                    "안녕하세요! 한국어로 대기질 정보를 제공할 수 있습니다. / Hello! I can provide air quality information in Korean.",
                                    "Здравствуйте! Я могу предоставить информацию о качестве воздуха на русском языке. / Hello! I can provide air quality information in Russian.",
                                    "We offer air quality information in multiple languages. Which language would you prefer?",
                                    "Our language support includes Spanish, Chinese, Korean, and Russian. Please specify your preferred language."
                                ];
                                addMessage(languageResponses[Math.floor(Math.random() * languageResponses.length)], 'bot', chat.chatMessages, chatIndex);
                            } else if (isAccessibilityRequest) {
                                const accessibilityResponses = [
                                    "I can provide screen-reader friendly air quality updates and alerts.",
                                    "For mobility concerns, I can help find accessible routes to air-conditioned spaces and clean air centers.",
                                    "We offer audio alerts and large text formats for air quality information.",
                                    "I can provide information about wheelchair-accessible air quality shelters and transportation.",
                                    "Need specific accessibility accommodations? I'm here to help make air quality information accessible for everyone.",
                                    "Our air quality alerts are available in multiple formats including audio, visual, and text-to-speech compatible versions."
                                ];
                                addMessage(accessibilityResponses[Math.floor(Math.random() * accessibilityResponses.length)], 'bot', chat.chatMessages, chatIndex);
                            } else {
                                const responses = [
                                    "I'm here to help with air quality information in NYC! I can assist in multiple languages and provide accessible formats.",
                                    "Need air quality updates? I can provide them in different languages and accessible formats for everyone.",
                                    "Ask me about air quality in any NYC neighborhood - I support multiple languages and accessibility needs!",
                                    "I can help with real-time air quality data, available in multiple languages and accessible formats.",
                                    "Looking for air quality information? I can provide updates in your preferred language and format.",
                                    "Get neighborhood-specific air quality alerts in your preferred language or accessibility format!"
                                ];
                                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                                addMessage(randomResponse, 'bot', chat.chatMessages, chatIndex);
                            }
                        }
                    }, 1000);
                }
            }
        };
    }

    // Function to handle chat tab switching with smooth gradient transition
    window.toggleChat = (index) => {
        const selectedChat = chats[index - 1];
        const previousIndex = currentIndex;
        
        // Close all chats first
        chats.forEach(chat => {
            chat.container.classList.add('collapsed');
            chat.toggle.classList.remove('active');
        });
        
        // Update indices
        currentChatIndex = index;
        currentIndex = index - 1;
        
        // Smoothly transition the gradient
        smoothTransition(previousIndex, currentIndex);
        
        // Open selected chat with delay to allow for transition
        setTimeout(() => {
            selectedChat.container.classList.remove('collapsed');
            selectedChat.toggle.classList.add('active');
            selectedChat.messageInput.focus();
        }, 100);
    };

    // Set up event listeners for each chat
    chats.forEach((chat, index) => {
        const chatIndex = index + 1;
        chat.sendButton.addEventListener('click', createSendMessageHandler(chat, chatIndex));
        chat.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                createSendMessageHandler(chat, chatIndex)();
            }
        });
    });

    // Open first chat by default
    toggleChat(1);

    // Helper function to add light slang to help responses
    function slangifyHelp(response) {
        const lightSlangIntros = [
            "Yo",
            "Hey",
            "Listen",
            "For real",
            "Real talk"
        ];
        
        const lightSlangOutros = [
            "fr",
            "tho",
            "forreal",
            "no cap",
            "💯"
        ];

        if (Math.random() < 0.5) { // 50% chance to add intro
            response = `${lightSlangIntros[Math.floor(Math.random() * lightSlangIntros.length)]}, ${response}`;
        }

        if (Math.random() < 0.3) { // 30% chance to add outro
            response = `${response} ${lightSlangOutros[Math.floor(Math.random() * lightSlangOutros.length)]}`;
        }

        return response;
    }
});
