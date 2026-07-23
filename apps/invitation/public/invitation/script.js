document.body.classList.add("is-loading");

// =============================================================================
// DRESS INSPIRATION LOOKBOOK SYSTEM
// =============================================================================
const DRESS_INSPIRATION_CONFIG = {
    haldi: {
        folder: "haldi",
        prefix: "h",
        title: "Haldi Style Guide",
        counts: { w: 5, m: 5 },
        titles: {
            w: ["Anarkali Graced Lehanga", "Flowing Saree Elegance", "Soft Pastel Saree", "Ivory Floral Saree", "Soft White Anarkali"],
            m: ["Ivory Linen Kurta", "Mustard Nehru Ensemble", "Minimal Linen Kurta", "Marigold Heritage", "Pastel Yellow Linen Kurta"]
        },
        stylings: {
            w: [
                "Vibrant • Festive • Graceful",
                "Floral • Breezy • Summery",
                "Pastel • Lightweight • Traditional",
                "Classic • Floral • Salwar",
                "Yellow Chiffon • Minimal • Flowing"
            ],
            m: [
                "Turmeric • Raw Silk • Classic",
                "Yellow Waistcoat • Festive • Sleek",
                "Pastel Fusion • Modern • Active",
                "Crisp White • Stole Accents • Clean",
                "Linen • Breathable • Contemporary"
            ]
        },
        descriptions: {
            w: [
                "Vibrant yellow shades with mirror or embroidery details.",
                "Summery floral prints for a cheerful, traditional look.",
                "Elegant lightweight pastels with gold borders.",
                "Traditional mustard yellow salwar suits for convenience.",
                "Flowing yellow chiffon sarees with minimal borders."
            ],
            m: [
                "Classic turmeric hued raw silk or soft cotton kurtas.",
                "Sleek yellow waistcoats to add a festive layer.",
                "Modern pastel fusion wear designed for movement.",
                "Clean white traditional wear with yellow stole accents.",
                "Light breathable linen shirts in shades of yellow."
            ]
        }
    },
    nalang: {
        folder: "nalang",
        prefix: "n",
        title: "Nalang Style Guide",
        counts: { w: 5, m: 5 },
        titles: {
            w: [
                { left: "Lavender Grace Saree", right: "Sage Blossom Suit" },
                { left: "Botanical Bloom Saree", right: "Peach Whisper Suit" },
                { left: "Blush Pearl Saree", right: "Mint Celeste Ensemble" },
                { left: "Lavender Modest Gown", right: "Sage Garden Anarkali" },
                { left: "Peach Garden Saree", right: "Powder Blue Modest Set" }
            ],
            m: [
                { left: "Sky Breeze Linen Shirt", right: "Sage Resort Co-ord" },
                { left: "Ivory Heritage Kurta", right: "Mint Polo Classic" },
                { left: "Mint Riviera Shirt", right: "Sage Heritage Veshti" },
                { left: "Blush Polo Classic", right: "Ivory Weekend Layers" },
                { left: "Mint Casual Edit", right: "Lavender Heritage Kurta" }
            ]
        },
        descriptions: {
            w: [
                { left: "Delicate lavender drapes create graceful elegance with subtle shimmer.", right: "Fresh floral embroidery brings effortless sophistication to the celebration." },
                { left: "Soft floral drapes offer timeless femininity with natural charm.", right: "Minimal peach tailoring delivers refined elegance and comfort." },
                { left: "Romantic blush embroidery creates a graceful and timeless festive look.", right: "Flowing mint silhouettes embody soft sophistication and effortless beauty." },
                { left: "Graceful flowing layers with modest elegance and delicate sparkle.", right: "Pastel floral artistry brings modern refinement to traditional wear." },
                { left: "Elegant peach florals blend timeless draping with soft romance.", right: "Powder blue tailoring creates a serene and sophisticated festive statement." }
            ],
            m: [
                { left: "Airy blue linen paired with cream tailoring for effortless daytime elegance.", right: "Soft sage tones create a fresh and refined festive statement." },
                { left: "Classic ivory traditional wear designed for timeless family celebrations.", right: "Modern knit styling with pastel sophistication and relaxed charm." },
                { left: "Fresh linen separates crafted for relaxed elegance and comfort.", right: "Traditional pastel styling with effortless cultural sophistication." },
                { left: "Soft blush knitwear delivers understated luxury for daytime festivities.", right: "Neutral layering creates a clean contemporary celebration look." },
                { left: "Contemporary mint styling with clean lines and timeless simplicity.", right: "Pastel lavender tradition meets modern elegance with refined tailoring." }
            ]
        }
    },
    sangeet: {
        folder: "sangeet",
        prefix: "s",
        title: "Sangeet Style Guide",
        counts: { w: 5, m: 5 },
        titles: {
            w: [
                "Ivory Radiance Sharara",
                "Mauve Moonlight Sharara",
                "Sage Celeste Gown",
                "Midnight Emerald Ensemble",
                "Emerald & Wine Evening Gowns"
            ],
            m: [
                "Ivory Luxe Resort Suit",
                "Midnight Noir Blazer",
                "Sandstone Evening Layers",
                "Emerald Noir Evening Suit",
                "Champagne Riviera Set"
            ]
        },
        stylings: {
            w: [
                "Sparkling • Glamorous • Unforgettable",
                "Romantic • Flowing • Evening",
                "Soft • Draped • Sophisticated",
                "Rich • Regal • Contemporary",
                "Jewel • Luxurious • Striking"
            ],
            m: [
                "Relaxed • Ivory • Evening",
                "Dark • Textured • Cocktail",
                "Neutral • Refined • Festive",
                "Deep Emerald • Bold • Elegant",
                "Minimal • Knit • Sunset"
            ]
        },
        descriptions: {
            w: [
                "Sparkling ivory embroidery brings graceful glamour to an unforgettable celebration.",
                "Romantic mauve shimmer and flowing layers create effortless evening elegance.",
                "Soft sage sparkle and graceful draping embody timeless sophistication.",
                "Rich emerald embroidery offers regal elegance with contemporary festive appeal.",
                "Luxurious jewel tones and flowing silhouettes make a striking celebration statement."
            ],
            m: [
                "Relaxed ivory tailoring with effortless sophistication for elegant evening celebrations.",
                "Dark textured tailoring delivers timeless charm with modern cocktail-night confidence.",
                "Warm neutral layering creates a refined contemporary look for festive celebrations.",
                "Deep emerald tailoring paired with black accents for a bold yet elegant statement.",
                "Minimal knit styling and soft champagne tones define relaxed luxury after sunset."
            ]
        }
    },
    nikkah: {
        folder: "nikkah",
        prefix: "k",
        title: "Nikkah Style Guide",
        counts: { w: 5, m: 5 },
        titles: {
            w: [
                {
                    left: { title: "Sage Modest Luxe", styling: "Modest • Graceful • Elegant", desc: "Flowing sage embroidery creates a serene and sophisticated festive look." },
                    right: { title: "Pearl Ivory Saree", styling: "Classic • Timeless • Regal", desc: "Intricate ivory embroidery elevates traditional draping with effortless elegance." }
                },
                {
                    left: { title: "Royal Sapphire Gown", styling: "Regal • Luxurious • Graceful", desc: "Deep sapphire embroidery delivers unforgettable evening sophistication." },
                    right: { title: "Emerald Heritage Saree", styling: "Traditional • Rich • Elegant", desc: "Classic emerald silk showcases timeless beauty with regal detailing." }
                },
                {
                    left: { title: "Blush Modest Ensemble", styling: "Soft • Elegant • Feminine", desc: "Delicate blush embroidery creates refined elegance with modest styling." },
                    right: { title: "Olive Satin Abaya", styling: "Modest • Contemporary • Luxurious", desc: "Fluid olive satin offers graceful movement with understated sophistication." }
                },
                {
                    left: { title: "Burgundy Heritage Suit", styling: "Traditional • Rich • Festive", desc: "Warm burgundy embroidery reflects timeless celebration and refined craftsmanship." },
                    right: { title: "Fuchsia Celebration Set", styling: "Modern • Vibrant • Chic", desc: "Bold jewel tones bring confident glamour to the wedding festivities." }
                },
                {
                    left: { title: "Emerald Evening Gown", styling: "Elegant • Flowing • Luxurious", desc: "Graceful emerald draping creates an effortlessly regal evening presence." },
                    right: { title: "Royal Wine Anarkali", styling: "Classic • Regal • Sophisticated", desc: "Rich wine embroidery blends timeless tradition with luxurious elegance." }
                }
            ],
            m: [
                {
                    left: { title: "Ivory Executive Suit", styling: "Modern • Elegant • Timeless", desc: "A refined ivory suit tailored for sophisticated daytime celebrations." },
                    right: { title: "Charcoal Regal Sherwani", styling: "Royal • Classic • Distinguished", desc: "A structured charcoal sherwani that blends heritage with contemporary luxury." }
                },
                {
                    left: { title: "Stone Urban Layers", styling: "Minimal • Modern • Smart", desc: "Neutral layering creates effortless sophistication with relaxed tailoring." },
                    right: { title: "Champagne Prestige Suit", styling: "Clean • Luxurious • Refined", desc: "Champagne tailoring offers timeless elegance for a polished wedding appearance." }
                },
                {
                    left: { title: "Ivory Emirati Bisht", styling: "Traditional • Regal • Elegant", desc: "A ceremonial bisht paired with crisp white attire for graceful Islamic elegance." },
                    right: { title: "Linen Riviera Suit", styling: "Modern • Relaxed • Premium", desc: "Soft linen tailoring delivers understated luxury with effortless charm." }
                },
                {
                    left: { title: "Navy Signature Suit", styling: "Executive • Sharp • Timeless", desc: "Classic navy tailoring creates an impeccably polished formal statement." },
                    right: { title: "Emerald Royal Bandhgala", styling: "Royal • Sophisticated • Bold", desc: "Rich emerald tailoring embodies regal confidence with refined detailing." }
                },
                {
                    left: { title: "Ivory Heritage Sherwani", styling: "Classic • Regal • Traditional", desc: "Elegant ivory embroidery celebrates timeless cultural sophistication." },
                    right: { title: "Modern Ivory Linen", styling: "Minimal • Contemporary • Elegant", desc: "Relaxed ivory tailoring offers clean modern luxury for daytime festivities." }
                }
            ]
        },
        descriptions: {}
    },
    valima: {
        folder: "valima",
        prefix: "v",
        title: "Valima Style Guide",
        counts: { w: 5, m: 5 },
        titles: {
            w: ["Designer Gown", "Modern Silk Saree", "Pastel Lehenga", "Contemporary Sharara", "Floor-Length Jacket Suit"],
            m: ["Formal Tuxedo", "Classic Black Tie Suit", "Tailored Sherwani", "Three-Piece Suit", "Modern Jodhpur Suit"]
        },
        stylings: {
            w: [
                "Contemporary • Structured • Luxury",
                "Silk • Pastel • Minimal",
                "Intricate • Silver • Pastel",
                "Chic • Sequined • Modern",
                "Elegant • Layered • Floor-Length"
            ],
            m: [
                "Tuxedo • Satin Lapel • Sleek",
                "Tailored • Charcoal • Navy",
                "Sherwani • Understated • Reception",
                "Double-Breasted • Classic • 3-Piece",
                "Jodhpur Suit • Brass Buttons • Modern"
            ]
        },
        descriptions: {
            w: [
                "Contemporary structured gowns with luxury trail details.",
                "Sophisticated silks in modern, minimal pastel shades.",
                "Intricately detailed pastel lehengas with silver work.",
                "Chic modern shararas with sequin work.",
                "Elegant floor-length jackets layered over trousers."
            ],
            m: [
                "Sleek midnight black tuxedo with satin lapels.",
                "Tailored luxury formal suits in charcoal or navy.",
                "Understated premium sherwani for the final reception look.",
                "Double-breasted classic three-piece suit.",
                "Modern jodhpur suits with elegant brass buttons."
            ]
        }
    },
    reception: {
        folder: "nikkah",
        prefix: "k",
        title: "Wedding Feast & Reception",
        counts: { w: 5, m: 5 },
        shuffleOrder: {
            w: [3, 5, 1, 4, 2],
            m: [4, 2, 5, 1, 3]
        },
        titles: {
            w: [
                {
                    left: { title: "Sage Celeste Abaya", desc: "Soft sage elegance with graceful modest luxury.", styling: ["Nude heels", "Champagne clutch", "Pearl earrings", "Satin hijab"] },
                    right: { title: "Ivory Noor Saree", desc: "Classic ivory drapes radiate timeless wedding elegance.", styling: ["Pearl jewellery", "Nude heels", "Champagne clutch", "Soft makeup"] }
                },
                {
                    left: { title: "Royal Sapphire Gown", desc: "Rich sapphire embroidery creates regal evening sophistication.", styling: ["Silver earrings", "Metallic heels", "Crystal clutch", "Soft curls"] },
                    right: { title: "Emerald Heritage Saree", desc: "Traditional emerald silk with luxurious golden craftsmanship.", styling: ["Temple jewellery", "Gold bangles", "Gold heels", "Elegant bun"] }
                },
                {
                    left: { title: "Blush Grace Ensemble", desc: "Soft blush tones bring warmth and refined celebration elegance.", styling: ["Nude heels", "Pearl clutch", "Rose-gold jewellery", "Light makeup"] },
                    right: { title: "Magenta Celebration Set", desc: "Bold magenta layers create a vibrant festive statement.", styling: ["Gold heels", "Statement earrings", "Champagne clutch", "Soft curls"] }
                },
                {
                    left: { title: "Emerald Evening Gown", desc: "Flowing emerald elegance crafted for luxurious evening celebrations.", styling: ["Gold clutch", "Gold earrings", "Metallic heels", "Soft waves"] },
                    right: { title: "Royal Maroon Ensemble", desc: "Rich maroon embroidery reflects timeless festive grandeur.", styling: ["Antique gold jewellery", "Nude heels", "Gold clutch", "Elegant bun"] }
                },
                {
                    left: { title: "Peach Blossom Saree", desc: "Romantic peach florals create graceful contemporary elegance.", styling: ["Pearl earrings", "Nude heels", "Soft curls", "Champagne clutch"] },
                    right: { title: "Powder Blue Modest Set", desc: "Soft blue tailoring offers refined modest sophistication.", styling: ["Beige hijab", "Nude heels", "Pearl handbag", "Minimal jewellery"] }
                }
            ],
            m: [
                {
                    left: { title: "Ivory Prestige Suit", desc: "Modern ivory tailoring crafted for an elegant wedding celebration.", styling: ["Brown leather loafers", "White dress shirt", "Beige pocket square", "Silver watch"] },
                    right: { title: "Charcoal Regal Sherwani", desc: "Classic charcoal heritage tailoring with timeless ceremonial elegance.", styling: ["Black formal shoes", "Black kurta", "Silver pocket square", "Minimal accessories"] }
                },
                {
                    left: { title: "Stone Contemporary Layers", desc: "Relaxed neutral layering with refined modern sophistication.", styling: ["Black loafers", "Black shirt", "Leather watch", "No tie"] },
                    right: { title: "Champagne Luxe Suit", desc: "Soft champagne tailoring designed for effortless reception elegance.", styling: ["Brown loafers", "Cream shirt", "Pocket square", "Gold watch"] }
                },
                {
                    left: { title: "Royal Bisht Ensemble", desc: "Traditional ceremonial attire with distinguished timeless luxury.", styling: ["White thobe", "Gold bisht", "Brown leather shoes", "Classic silver watch"] },
                    right: { title: "Linen Reception Suit", desc: "Minimal linen tailoring for an elegant daytime wedding feast.", styling: ["Brown loafers", "White shirt", "Beige pocket square", "Minimal belt"] }
                },
                {
                    left: { title: "Midnight Executive Suit", desc: "Sharp navy tailoring for sophisticated formal celebrations.", styling: ["Navy tie", "Black Oxford shoes", "White pocket square", "Steel watch"] },
                    right: { title: "Emerald Royal Bandhgala", desc: "Deep emerald tailoring blends royal tradition with modern refinement.", styling: ["Black trousers", "Black formal shoes", "Gold chain brooch", "Pocket square"] }
                },
                {
                    left: { title: "Ivory Heritage Sherwani", desc: "Elegant ivory ceremonial wear with timeless craftsmanship.", styling: ["Brown leather loafers", "White churidar", "Ivory pocket square", "Minimal watch"] },
                    right: { title: "Classic Ivory Smart Casual", desc: "Relaxed ivory separates for effortless family celebration style.", styling: ["Brown belt", "Brown loafers", "White mandarin shirt", "Steel watch"] }
                }
            ]
        },
        descriptions: {}
    }
};

function generateOutfitCards(eventKey) {
    const config = DRESS_INSPIRATION_CONFIG[eventKey];
    if (!config) return "";

    const outfits = [];
    const types = ['w', 'm'];

    types.forEach(t => {
        const count = config.counts[t] || 0;
        const order = config.shuffleOrder?.[t] || Array.from({ length: count }, (_, idx) => idx + 1);

        order.forEach(i => {
            const imagePath = `assets/dress-inspirations/${config.folder}/${config.prefix}${t}${i}.jpg`;
            const title = config.titles[t]?.[i - 1] || (t === 'w' ? 'Women Outfit' : 'Men Outfit');
            const desc = config.descriptions[t]?.[i - 1] || 'Premium outfit inspiration.';
            const isDual = typeof title === 'object' && title !== null && 'left' in title;

            outfits.push({
                image: imagePath,
                title: title,
                desc: desc,
                isDual: isDual
            });
        });
    });

    return outfits.map(outfit => {
        if (outfit.isDual) {
            const leftTitle = typeof outfit.title.left === 'object' ? outfit.title.left.title : outfit.title.left;
            const leftDesc = typeof outfit.title.left === 'object' ? outfit.title.left.desc : outfit.desc.left;
            const leftStyling = typeof outfit.title.left === 'object' ? outfit.title.left.styling : null;

            const rightTitle = typeof outfit.title.right === 'object' ? outfit.title.right.title : outfit.title.right;
            const rightDesc = typeof outfit.title.right === 'object' ? outfit.title.right.desc : outfit.desc.right;
            const rightStyling = typeof outfit.title.right === 'object' ? outfit.title.right.styling : null;

            const renderStyling = (items) => {
                if (!items) return "";
                if (typeof items === 'string') {
                    return `<div class="lookbook-styling-text">${items}</div>`;
                }
                if (Array.isArray(items)) {
                    return `<div class="lookbook-styling-text">${items.join(" • ")}</div>`;
                }
                return "";
            };

            return `
                <div class="lookbook-card dual-look-card">
                    <div class="lookbook-img-wrap">
                        <img src="${outfit.image}" alt="${leftTitle} & ${rightTitle}" loading="lazy">
                    </div>
                    <div class="lookbook-info-dual">
                        <div class="look-col left-look">
                            <h4>${leftTitle}</h4>
                            ${renderStyling(leftStyling)}
                            <p>${leftDesc}</p>
                        </div>
                        <div class="look-col right-look">
                            <h4>${rightTitle}</h4>
                            ${renderStyling(rightStyling)}
                            <p>${rightDesc}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        return `
            <div class="lookbook-card">
                <div class="lookbook-img-wrap">
                    <img src="${outfit.image}" alt="${outfit.title}" loading="lazy">
                </div>
                <div class="lookbook-info">
                    <h4>${outfit.title}</h4>
                    <p>${outfit.desc}</p>
                </div>
            </div>
        `;
    }).join("");
}

function getDressInspirationMarkup(eventId, eventName) {
    const key = eventId?.toLowerCase() || "";
    let dataKeys = [];
    if (key.includes("haldi") || eventName?.toLowerCase().includes("haldi")) dataKeys = ["haldi"];
    else if (key.includes("nalang") || eventName?.toLowerCase().includes("nalang")) dataKeys = ["nalang"];
    else if (key.includes("sangeet") || eventName?.toLowerCase().includes("sangeet")) dataKeys = ["sangeet"];
    else if (key.includes("nikah") || eventName?.toLowerCase().includes("nikah")) dataKeys = ["nikkah"];
    // Valima style guide temporarily hidden until date and dress code are finalized
    // else if (key.includes("valima") || eventName?.toLowerCase().includes("valima")) dataKeys = ["valima"];
    else if (key.includes("reception") || eventName?.toLowerCase().includes("reception")) dataKeys = ["reception"];

    if (dataKeys.length === 0) return "";

    return dataKeys.map(dataKey => {
        const config = DRESS_INSPIRATION_CONFIG[dataKey];
        const outfitsHtml = generateOutfitCards(dataKey);
        const totalOutfits = (config.counts.w || 0) + (config.counts.m || 0);
        const buttonLabel = "Style Guide";

        return `
            <div class="dress-inspiration-container" style="margin-top: 15px;">
                <button type="button" class="btn-dress-inspiration" data-event="${dataKey}">
                    <span>${buttonLabel}</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" class="chevron"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div class="dress-inspiration-panel" id="inspiration-${dataKey}" style="display: none; opacity: 0; height: 0;">
                    <div class="dress-inspiration-inner">
                        <div class="dress-lookbook-carousel" data-event="${dataKey}">
                            ${outfitsHtml}
                        </div>
                        <div class="lookbook-dots">
                            ${Array.from({ length: totalOutfits }).map((_, i) => `<span class="lookbook-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join("")}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function initLookbookCarousel(carousel) {
    let isDown = false;
    let startX;
    let scrollLeft;

    // Mouse drag controls
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('dragging');
        carousel.style.scrollSnapType = 'none';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('dragging');
        carousel.style.scrollSnapType = 'x mandatory';
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('dragging');
        carousel.style.scrollSnapType = 'x mandatory';
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Touch momentum/scroll tracking
    const dots = carousel.parentElement.querySelectorAll('.lookbook-dot');
    const cards = carousel.querySelectorAll('.lookbook-card');

    carousel.addEventListener('scroll', () => {
        const cardWidth = cards[0]?.offsetWidth || 190;
        const gap = 16;
        const step = cardWidth + gap;
        const index = Math.round(carousel.scrollLeft / step);

        dots.forEach((dot, idx) => {
            if (idx === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Parallax image shifting
        cards.forEach(card => {
            const img = card.querySelector('img');
            if (img) {
                const cardLeft = card.offsetLeft;
                const relativeOffset = cardLeft - carousel.scrollLeft;
                const carouselWidth = carousel.offsetWidth || 1;
                const shift = (relativeOffset / carouselWidth) * -20; // Shift parallax X offset slightly
                img.style.setProperty('--scroll-offset', `${shift}px`);
            }
        });
    });

    // Tap page dots to navigate
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            const cardWidth = cards[0]?.offsetWidth || 190;
            const gap = 16;
            carousel.scrollTo({
                left: idx * (cardWidth + gap),
                behavior: 'smooth'
            });
        });
    });
}

function getWeddingSettings() {
    const storageKey = "ra_settings_default_workspace_arifa_rozar_wedding";
    const freshDefaults = {
        brideName: "Arifa Khan",
        groomName: "Rozar Khan",
        brideShortName: "Arifa",
        groomShortName: "Rozar",
        brideParentNames: "A. Mohammed Khan & M. Feroza Begum",
        groomParentNames: "J. Peer Mohideen & P. Kather Beevi",
        rsvpDeadline: "2026-08-15T23:59:59",
        rsvpOpen: true,
        theme: "dark",
        primaryColor: "#D4AF37",
        secondaryColor: "#0F6D5B",
        invitationTitleDefault: "Rozar & Arifa Wedding Invitation",
        invitationWelcomeText: "In the name of Allah, the Most Beneficent, the Most Merciful. We cordially invite you to share our joy as we unite in holy matrimony.",
        venues: [
            {
                id: 'nsk_mahal',
                name: 'NSK & NKR A/C Mahal',
                address: 'GST Main Rd, Lion City, Thiru Nagar, Thanakkankulam',
                city: 'Madurai',
                state: 'Tamil Nadu',
                country: 'India',
                googleMapsUrl: 'https://maps.app.goo.gl/nHmxp5HqnWTBi1R56'
            },
            {
                id: 'brides_residence',
                name: "Bride's Residence",
                address: 'Madurai',
                city: 'Madurai',
                state: 'Tamil Nadu',
                country: 'India',
                googleMapsUrl: 'https://maps.app.goo.gl/5Z7sW3SojqCc7gPV9'
            },
            {
                id: 'grooms_residence',
                name: "Groom's Residence",
                address: 'Madurai',
                city: 'Madurai',
                state: 'Tamil Nadu',
                country: 'India',
                googleMapsUrl: ''
            },
            {
                id: 'celebration_hall',
                name: 'Celebration Hall',
                address: 'Madurai',
                city: 'Madurai',
                state: 'Tamil Nadu',
                country: 'India',
                googleMapsUrl: 'https://maps.app.goo.gl/nHmxp5HqnWTBi1R56'
            }
        ],
        events: [
            {
                id: 'haldi',
                name: '🌿 Haldi Ceremony',
                date: '2026-08-28T19:00:00+05:30',
                venueId: 'brides_residence',
                description: 'A colourful evening filled with blessings, laughter and family traditions as the wedding celebrations begin.'
            },
            {
                id: 'nalang',
                name: '✨ Nalang Ceremony',
                date: '2026-08-29T11:00:00+05:30',
                venueId: 'grooms_residence',
                description: 'Traditional pre-wedding rituals celebrated with close family and friends.'
            },
            {
                id: 'sangeet',
                name: '🎶 Sangeet & DJ Night',
                date: '2026-08-29T19:00:00+05:30',
                venueId: 'celebration_hall',
                description: 'An evening of music, dance and unforgettable memories with family and friends.'
            },
            {
                id: 'nikah',
                name: '💍 Nikkah',
                date: '2026-08-30T09:00:00+05:30',
                venueId: 'nsk_mahal',
                description: 'The sacred Nikāh ceremony where two souls begin their lifelong journey together.'
            },
            {
                id: 'reception',
                name: '🍽️ Wedding Feast & Reception',
                date: '2026-08-30T11:00:00+05:30',
                venueId: 'nsk_mahal',
                description: 'Join us for lunch as we celebrate our union with love, joy and gratitude.'
            },
            {
                id: 'valima',
                name: 'Valima',
                date: 'TBA',
                venueId: 'nsk_mahal',
                description: 'The Valima reception will be announced soon. We look forward to celebrating together once the date is finalized.'
            }
        ]
    };

    const data = localStorage.getItem(storageKey);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (!parsed.events || parsed.events.length < 6) {
                parsed.events = freshDefaults.events;
                parsed.venues = freshDefaults.venues;
                localStorage.setItem(storageKey, JSON.stringify(parsed));
            }
            return parsed;
        } catch (e) { }
    }
    return freshDefaults;
}

const settings = getWeddingSettings();

// Dynamically write settings to DOM on script load
(function initializeDynamicSettings() {
    document.title = settings.invitationTitleDefault || `${settings.groomShortName} & ${settings.brideShortName} | Wedding Invitation`;

    // Inject custom colors
    if (settings.primaryColor) {
        document.documentElement.style.setProperty('--color-gold', settings.primaryColor);
        document.documentElement.style.setProperty('--color-gold-soft', settings.primaryColor);
    }
    if (settings.secondaryColor) {
        document.documentElement.style.setProperty('--color-emerald', settings.secondaryColor);
    }

    // Hero title & date
    const heroTitle = document.querySelector(".hero-content h1");
    if (heroTitle && settings.groomShortName && settings.brideShortName) {
        heroTitle.innerHTML = `<span class="nobrk">${settings.groomShortName}</span> <span class="ampersand">&amp;</span> <span class="nobrk">${settings.brideShortName}</span>`;
    }
    const heroDate = document.querySelector(".hero-content .eyebrow");
    const nikahEvent = settings.events?.find(e => e.id === 'nikah' || e.name?.toLowerCase().includes('nikah')) || settings.events?.[0];
    if (heroDate && nikahEvent) {
        const dateObj = new Date(nikahEvent.date);
        heroDate.textContent = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Events timeline
    const timelineContainer = document.querySelector(".timeline-events");
    if (timelineContainer && settings.events) {
        timelineContainer.innerHTML = settings.events.map((event, index) => {
            const venue = settings.venues?.find(v => v.id === event.venueId) || {};
            const sideClass = index % 2 === 0 ? "timeline-left" : "timeline-right";

            const isValima = event.id === 'valima' || event.name?.toLowerCase().includes('valima');
            const isTba = isValima || !event.date || event.date === 'TBA' || isNaN(new Date(event.date).getTime());

            if (isTba) {
                return `
                    <article class="event-card glass-card event-valima ${sideClass}">
                        <div class="timeline-dot" aria-hidden="true"></div>
                        <div class="valima-islamic-bg" aria-hidden="true">
                            <svg class="valima-lantern-svg" viewBox="0 0 100 100" fill="none" stroke="var(--color-gold)" stroke-width="1">
                                <path d="M50,5 L63,20 L80,20 L80,37 L95,50 L80,63 L80,80 L63,80 L50,95 L37,80 L20,80 L20,63 L5,50 L20,37 L20,20 L37,20 Z" opacity="0.1" />
                                <path d="M48,32 A12,12 0 1,0 60,46 A10,10 0 1,1 48,32 Z" fill="var(--color-gold)" opacity="0.2" stroke="none" />
                                <path d="M50,45 L50,38 M45,45 L55,45 L52,55 L48,55 Z" stroke-width="1.5" opacity="0.25" />
                                <line x1="50" y1="20" x2="50" y2="38" opacity="0.25" />
                            </svg>
                        </div>
                        <p class="event-date">To Be Announced</p>
                        <h3>🤍 ${event.name}</h3>
                        <div class="valima-coming-soon-badge">Coming Soon</div>
                        <p class="event-description">${event.description || "The Valima reception will be announced soon. We look forward to celebrating with everyone once the date is confirmed."}</p>
                        ${getDressInspirationMarkup(event.id, event.name)}
                    </article>
                `;
            }

            const dateObj = new Date(event.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).replace(',', ' •');

            let formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
            });

            if (event.id === 'sangeet' || event.name?.toLowerCase().includes('sangeet')) {
                formattedTime = "After 7:00 PM";
            }

            const locationText = venue.name || "To Be Announced";
            const mapsUrl = venue.googleMapsUrl || "#";

            return `
                <article class="event-card glass-card ${sideClass}">
                    <div class="timeline-dot" aria-hidden="true"></div>
                    <p class="event-date">${formattedDate}</p>
                    <h3>${event.name}</h3>
                    <p class="event-time">${formattedTime}</p>
                    ${venue.name ? `<p class="event-location"><a href="${mapsUrl}" target="_blank" rel="noopener">${locationText}</a></p>` : `<p class="event-location">${locationText}</p>`}
                    ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                    ${getDressInspirationMarkup(event.id, event.name)}
                </article>
            `;
        }).join('');
    }

    // Venue section
    const primaryVenue = settings.venues?.[0];
    if (primaryVenue) {
        const venueNameEl = document.querySelector(".venue-info .venue-name");
        if (venueNameEl) venueNameEl.textContent = primaryVenue.name;

        const venueAddressEl = document.querySelector(".venue-info .venue-address");
        if (venueAddressEl) {
            venueAddressEl.innerHTML = `${primaryVenue.address}<br>${primaryVenue.city}, ${primaryVenue.state}, ${primaryVenue.country}`;
        }

        const venueMapBtn = document.querySelector(".venue-info .map-btn");
        if (venueMapBtn && primaryVenue.googleMapsUrl) {
            venueMapBtn.href = primaryVenue.googleMapsUrl;
        }
    }

    // RSVP form lock
    if (settings.rsvpOpen === false || (settings.rsvpDeadline && new Date(settings.rsvpDeadline).getTime() < Date.now())) {
        const rsvpFormContainer = document.getElementById("rsvpForm");
        if (rsvpFormContainer) {
            rsvpFormContainer.innerHTML = `<div class="rsvp-closed-msg text-center py-6 font-cinzel" style="color: var(--color-gold); font-size: 14px; font-weight: bold; padding: 40px 10px;">RSVP submissions are currently closed.</div>`;
        }
    }

    // Bind Dress Inspiration expansion events
    document.querySelectorAll(".btn-dress-inspiration").forEach(btn => {
        btn.addEventListener("click", () => {
            const dataKey = btn.getAttribute("data-event");
            const panel = document.getElementById(`inspiration-${dataKey}`);
            const carousel = panel.querySelector(".dress-lookbook-carousel");
            const cards = panel.querySelectorAll(".lookbook-card");

            if (panel.classList.contains("expanded")) {
                panel.classList.remove("expanded");
                btn.classList.remove("active");
                if (hasGsap()) {
                    gsap.to(panel, {
                        height: 0,
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.inOut",
                        onComplete: () => {
                            panel.style.display = "none";
                        }
                    });
                } else {
                    panel.style.display = "none";
                }
            } else {
                panel.classList.add("expanded");
                btn.classList.add("active");
                panel.style.display = "block";

                if (hasGsap()) {
                    gsap.killTweensOf(panel);
                    gsap.fromTo(panel,
                        { height: 0, opacity: 0 },
                        { height: "auto", opacity: 1, duration: 0.6, ease: "power2.out" }
                    );

                    gsap.killTweensOf(cards);
                    gsap.fromTo(cards,
                        { opacity: 0, y: 20, x: 25 },
                        {
                            opacity: 1,
                            y: 0,
                            x: 0,
                            duration: 0.8,
                            stagger: 0.1,
                            ease: "power3.out",
                            delay: 0.1
                        }
                    );
                } else {
                    panel.style.height = "auto";
                    panel.style.opacity = "1";
                    cards.forEach(c => c.style.opacity = "1");
                }

                // Initialize custom drag, scroll, parallax events once opened
                if (carousel && !carousel.classList.contains("initialized")) {
                    carousel.classList.add("initialized");
                    initLookbookCarousel(carousel);
                }
            }
        });
    });
})();

const loader = document.getElementById("loader");
const progress = document.querySelector(".loader-progress");
const beginBtn = document.getElementById("beginBtn");
const rsvpForm = document.getElementById("rsvpForm");
const rsvpMessage = document.getElementById("rsvpMessage");
const countdownEls = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
};

let loaderTimeline = null;

const hasGsap = () => {
    if (!window.gsap) return false;
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !prefersReduce;
};

// Enhanced Loader Ring Animation Loop
function initLoaderLoop() {
    if (!hasGsap()) return;

    const rays = document.querySelectorAll(".loader-logo-svg .loader-ray");
    const ring = document.querySelector(".loader-logo-svg .logo-ring");
    const container = document.querySelector(".loader-logo-svg svg");
    if (rays.length === 0 || !ring || !container) return;

    // Create a group for sparkles if it doesn't exist
    let sparklesGroup = container.querySelector(".sparkles-container");
    if (!sparklesGroup) {
        sparklesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        sparklesGroup.setAttribute("class", "sparkles-container");
        container.appendChild(sparklesGroup);
    }

    const triggerSparkles = () => {
        const points = [
            { x: 92, y: 50 }, // 3 o'clock
            { x: 8, y: 50 }   // 9 o'clock
        ];

        points.forEach(pt => {
            for (let i = 0; i < 8; i++) {
                const sparkle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                const angle = Math.random() * Math.PI * 2;
                const speed = 4 + Math.random() * 10;
                const radius = 0.4 + Math.random() * 0.8;

                sparkle.setAttribute("cx", pt.x);
                sparkle.setAttribute("cy", pt.y);
                sparkle.setAttribute("r", radius);
                sparkle.setAttribute("fill", "#D4AF37");
                sparkle.setAttribute("opacity", "1");
                sparklesGroup.appendChild(sparkle);

                gsap.to(sparkle, {
                    cx: pt.x + Math.cos(angle) * speed,
                    cy: pt.y + Math.sin(angle) * speed,
                    opacity: 0,
                    duration: 0.6 + Math.random() * 0.4,
                    ease: "power2.out",
                    onComplete: () => sparkle.remove()
                });
            }
        });
    };

    // Create repeating GSAP timeline for rays and pulsing
    const cycleDuration = 2.4;
    const meetTime = cycleDuration / 2; // 1.2s
    loaderTimeline = gsap.timeline({ repeat: -1 });

    // Initial state: hide rays
    gsap.set(rays, { opacity: 0 });

    // Flow path dashoffset animation: 30 -> -132
    loaderTimeline.fromTo(rays,
        { strokeDashoffset: 30 },
        { strokeDashoffset: -132, duration: cycleDuration, ease: "power1.inOut" },
        0
    );

    // Fade in rays at start, fade out at end
    loaderTimeline.fromTo(rays,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power1.out" },
        0
    );
    loaderTimeline.to(rays,
        { opacity: 0, duration: 0.3, ease: "power1.in" },
        cycleDuration - 0.3
    );

    // Midpoint: Rays meet at 3 o'clock and 9 o'clock
    loaderTimeline.add(() => {
        // Trigger sparkle particles
        triggerSparkles();

        // Ring pulse: briefly brighten and widen
        gsap.fromTo(".logo-ring-bg",
            { stroke: "#FFF", strokeWidth: 2.2, opacity: 0.8 },
            { stroke: "rgba(var(--color-gold-soft-rgb), 0.12)", strokeWidth: 1.5, opacity: 0.8, duration: 0.8, ease: "power2.out" }
        );

        gsap.fromTo(ring,
            { stroke: "#FFF", strokeWidth: 2.5 },
            { stroke: "var(--color-gold-soft)", strokeWidth: 1.5, duration: 0.8, ease: "power2.out" }
        );

        // Pulse energy points glow
        gsap.fromTo(".energy-glow-ring",
            { scale: 1.6, opacity: 1 },
            { scale: 1, opacity: 0.6, duration: 0.8, ease: "power2.out" }
        );

        // Pulse features slightly
        gsap.fromTo(".logo-char",
            { filter: "drop-shadow(0 0 2px var(--color-gold))" },
            { filter: "none", duration: 0.8, ease: "power2.out" }
        );
    }, meetTime);
}

// Call loop immediately to play during page loading
initLoaderLoop();

function splitTextIntoSpans(selector) {
    if (!hasGsap()) return;
    const element = document.querySelector(selector);
    if (!element) return;

    const nobrkSpans = element.querySelectorAll('.nobrk');
    if (nobrkSpans.length > 0) {
        nobrkSpans.forEach(span => {
            const text = span.textContent;
            span.innerHTML = text
                .split("")
                .map(char => `<span class="char-span">${char}</span>`)
                .join("");
        });
    } else {
        const text = element.textContent;
        element.innerHTML = text
            .split("")
            .map(char => {
                if (char === " ") return '<span class="char-span spacer-span">&nbsp;</span>';
                return `<span class="char-span">${char}</span>`;
            })
            .join("");
    }
}

function splitWordsIntoSpans(selector) {
    if (!hasGsap()) return;
    const element = document.querySelector(selector);
    if (!element) return;
    const words = element.innerHTML.split("<br>");
    element.innerHTML = words
        .map(line => {
            const lineHtml = line.split(" ").map(word => `<span class="word-span">${word}</span>`).join(" ");
            return `<span class="line-span">${lineHtml}</span>`;
        })
        .join("<br>");
}

function applyPersonalization() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get("guest") || urlParams.get("to");
    if (guestName && guestName.trim()) {
        const heroContent = document.querySelector(".hero-content");
        const tagline = document.querySelector(".hero-content .tagline");
        if (heroContent && tagline) {
            const greeting = document.createElement("p");
            greeting.className = "personal-greeting";
            greeting.textContent = `Dear ${decodeURIComponent(guestName).trim()},`;
            heroContent.insertBefore(greeting, tagline);
        }
    }
}

function initFloatingLabels() {
    const fields = document.querySelectorAll(".floating-field input, .floating-field select, .floating-field textarea");
    fields.forEach(field => {
        const toggleValue = () => {
            if (field.value && String(field.value).trim() !== "") {
                field.classList.add("has-value");
            } else {
                field.classList.remove("has-value");
            }
        };
        field.addEventListener("input", toggleValue);
        field.addEventListener("change", toggleValue);
        field.addEventListener("blur", toggleValue);
        toggleValue();
    });
}

function revealPage() {
    document.body.classList.remove("is-loading");

    if (loaderTimeline) {
        loaderTimeline.kill();
    }

    if (!loader) {
        return;
    }

    if (hasGsap()) {
        gsap.to(loader, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                loader.classList.add("is-hidden");

                splitTextIntoSpans(".hero-content h1");
                applyPersonalization();
                initFloatingLabels();

                const tl = gsap.timeline({ defaults: { ease: "cubic-bezier(0.22, 1, 0.36, 1)" } });

                const greeting = document.querySelector(".personal-greeting");
                if (greeting) {
                    tl.to(greeting, { opacity: 1, y: 0, duration: 0.7 });
                }

                // Elegant reveal of the luxury quotes and dividers
                tl.from(".hero-quote", {
                    opacity: 0,
                    y: 20,
                    duration: 0.8
                }, greeting ? "-=0.4" : "0");

                tl.from(".hero-support", {
                    opacity: 0,
                    y: 20,
                    duration: 0.7
                }, "-=0.6");

                tl.from(".hero-divider-gold", {
                    scaleX: 0,
                    opacity: 0,
                    duration: 0.6
                }, "-=0.5");

                tl.from(".hero-content .eyebrow", {
                    opacity: 0,
                    y: 15,
                    duration: 0.6
                }, "-=0.5");

                tl.to(".hero-content h1 .char-span", {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.02
                }, "-=0.5");

                tl.from("#beginBtn", {
                    opacity: 0,
                    y: 20,
                    duration: 0.5
                }, "-=0.4");
            }
        });
        return;
    }

    loader.classList.add("is-hidden");
}

window.addEventListener("load", () => {
    if (hasGsap()) {
        gsap.to(".loader-logo-svg .logo-ring", { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" });
        gsap.to(".loader-logo-svg .logo-char", { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", delay: 0.1 });
        if (progress) {
            gsap.fromTo(progress, { width: "0%" }, { width: "100%", duration: 1.0, ease: "power2.inOut" });
        }
    }

    createFloatingParticles();
    window.setTimeout(revealPage, 1000);
});

beginBtn?.addEventListener("click", () => {
    const target = document.getElementById("story");
    if (!target) return;
    if (hasGsap()) {
        const targetPos = target.getBoundingClientRect().top + window.scrollY;
        const obj = { y: window.scrollY };
        gsap.to(obj, {
            y: targetPos,
            duration: 1.4,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)",
            onUpdate: () => window.scrollTo(0, obj.y)
        });
    } else {
        target.scrollIntoView({ behavior: "smooth" });
    }
});

document.addEventListener("mousemove", (event) => {
    if (!hasGsap() || window.matchMedia("(max-width: 820px)").matches) {
        return;
    }

    const x = (event.clientX / window.innerWidth - 0.5) * 16;
    const y = (event.clientY / window.innerHeight - 0.5) * 16;

    gsap.to(".hero-image", {
        x,
        y,
        duration: 1.4,
        ease: "power2.out"
    });
});

const nikahEventForTimer = settings.events?.find(e => e.id === 'nikah' || e.name?.toLowerCase().includes('nikah')) || settings.events?.[0];
const weddingDate = new Date(nikahEventForTimer ? nikahEventForTimer.date : "2026-08-30T09:00:00+05:30").getTime();

function pad(value) {
    return String(value).padStart(2, "0");
}

function updateCountdown() {
    const distance = weddingDate - Date.now();

    if (distance <= 0) {
        countdownEls.days.textContent = "00";
        countdownEls.hours.textContent = "00";
        countdownEls.minutes.textContent = "00";
        countdownEls.seconds.textContent = "00";
        return;
    }

    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;

    countdownEls.days.textContent = pad(Math.floor(distance / day));
    countdownEls.hours.textContent = pad(Math.floor((distance % day) / hour));
    countdownEls.minutes.textContent = pad(Math.floor((distance % hour) / minute));
    countdownEls.seconds.textContent = pad(Math.floor((distance % minute) / 1000));
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

// Dynamic Gallery Full Frame Modal Functionality (Gallery 2.0 Redesigned)
const galleryItems = document.querySelectorAll(".gallery-item");
const modalOverlay = document.createElement("div");
modalOverlay.className = "modal-overlay";

const modalWrapper = document.createElement("div");
modalWrapper.className = "modal-wrapper";

const closeBtn = document.createElement("button");
closeBtn.className = "modal-close-btn";
closeBtn.innerHTML = "&times;";
closeBtn.type = "button";
closeBtn.setAttribute("aria-label", "Close modal");

const prevBtn = document.createElement("button");
prevBtn.className = "modal-nav-btn prev-btn";
prevBtn.innerHTML = "&#10094;";
prevBtn.type = "button";
prevBtn.setAttribute("aria-label", "Previous memory");

const nextBtn = document.createElement("button");
nextBtn.className = "modal-nav-btn next-btn";
nextBtn.innerHTML = "&#10095;";
nextBtn.type = "button";
nextBtn.setAttribute("aria-label", "Next memory");

const modalImage = document.createElement("img");
modalImage.className = "modal-frame-img";

const modalImageContainer = document.createElement("div");
modalImageContainer.className = "modal-image-container";
modalImageContainer.appendChild(prevBtn);
modalImageContainer.appendChild(nextBtn);
modalImageContainer.appendChild(modalImage);

const modalProgressContainer = document.createElement("div");
modalProgressContainer.className = "modal-progress-container";
const modalProgressBar = document.createElement("div");
modalProgressBar.className = "modal-progress-bar";
modalProgressContainer.appendChild(modalProgressBar);

const modalContent = document.createElement("div");
modalContent.className = "modal-text-content";

const modalDotsContainer = document.createElement("div");
modalDotsContainer.className = "modal-dots-container";

modalWrapper.appendChild(closeBtn);
modalWrapper.appendChild(modalImageContainer);
modalWrapper.appendChild(modalProgressContainer);
modalWrapper.appendChild(modalContent);
modalWrapper.appendChild(modalDotsContainer);
modalOverlay.appendChild(modalWrapper);
document.body.appendChild(modalOverlay);

let currentMemoryIndex = 0;
let isAnimating = false;
let previouslyFocusedEl = null;

// Focus trapping variables
let focusableElements = [];
let firstFocusableEl = null;
let lastFocusableEl = null;

function setupFocusableElements() {
    focusableElements = [closeBtn, prevBtn, nextBtn].filter(el => el && el.style.display !== "none");
    if (focusableElements.length > 0) {
        firstFocusableEl = focusableElements[0];
        lastFocusableEl = focusableElements[focusableElements.length - 1];
    }
}

// 1. Preload adjacent images
function preloadAdjacent(index) {
    const total = galleryItems.length;
    if (total === 0) return;

    const prevIdx = (index - 1 + total) % total;
    const nextIdx = (index + 1) % total;

    const prevUrl = galleryItems[prevIdx].querySelector("img")?.src;
    const nextUrl = galleryItems[nextIdx].querySelector("img")?.src;

    if (prevUrl) {
        const img1 = new Image();
        img1.src = prevUrl;
    }
    if (nextUrl) {
        const img2 = new Image();
        img2.src = nextUrl;
    }
}

// 2. Animate progress bar in modal
function updateModalProgressBar(index) {
    const percent = ((index + 1) / galleryItems.length) * 100;
    if (hasGsap()) {
        gsap.to(modalProgressBar, { width: `${percent}%`, duration: 0.35, ease: "power2.out" });
    } else {
        modalProgressBar.style.width = `${percent}%`;
    }
}

// 3. Render indicator dots
function updateModalDots(index) {
    let dotsHtml = "";
    for (let i = 0; i < galleryItems.length; i++) {
        dotsHtml += `<span class="modal-dot ${i === index ? 'active' : ''}" data-index="${i}" role="button" aria-label="Go to memory ${i + 1}"></span>`;
    }
    modalDotsContainer.innerHTML = dotsHtml;

    modalDotsContainer.querySelectorAll(".modal-dot").forEach(dot => {
        dot.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
            transitionToMemory(idx);
        });
    });
}

// 4. Carousel slide transition logic
function transitionToMemory(index) {
    if (isAnimating) return;
    isAnimating = true;
    currentMemoryIndex = index;

    AudioManager.playWhoosh();
    AudioManager.triggerHaptic(20);

    const targetItem = galleryItems[index];
    const img = targetItem.querySelector("img");
    const storyData = targetItem.querySelector(".caption-card");
    if (!img || !storyData) {
        isAnimating = false;
        return;
    }

    if (hasGsap()) {
        gsap.timeline()
            .to([modalImage, modalContent, modalDotsContainer], {
                opacity: 0,
                scale: 0.96,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    modalImage.src = img.src;
                    modalImage.alt = img.alt;

                    const title = storyData.querySelector("strong").outerHTML;
                    const dateText = storyData.querySelector(".caption-date").outerHTML;
                    const desc = storyData.querySelector("p").outerHTML;
                    modalContent.innerHTML = `
                        ${title}
                        ${dateText}
                        <div class="modal-separator" aria-hidden="true">♥</div>
                        ${desc}
                        <div class="modal-counter">Memory ${index + 1} of ${galleryItems.length}</div>
                    `;

                    preloadAdjacent(index);
                    updateModalProgressBar(index);
                    updateModalDots(index);
                }
            })
            .to([modalImage, modalContent, modalDotsContainer], {
                opacity: 1,
                scale: 1,
                duration: 0.35,
                ease: "power2.out",
                onComplete: () => {
                    isAnimating = false;
                    setupFocusableElements();
                }
            });
    } else {
        modalImage.src = img.src;
        modalImage.alt = img.alt;
        const title = storyData.querySelector("strong").outerHTML;
        const dateText = storyData.querySelector(".caption-date").outerHTML;
        const desc = storyData.querySelector("p").outerHTML;
        modalContent.innerHTML = `
            ${title}
            ${dateText}
            <div class="modal-separator" aria-hidden="true">♥</div>
            ${desc}
            <div class="modal-counter">Memory ${index + 1} of ${galleryItems.length}</div>
        `;
        preloadAdjacent(index);
        updateModalProgressBar(index);
        updateModalDots(index);
        isAnimating = false;
        setupFocusableElements();
    }
}

function showNextMemory() {
    const idx = (currentMemoryIndex + 1) % galleryItems.length;
    transitionToMemory(idx);
}

function showPrevMemory() {
    const idx = (currentMemoryIndex - 1 + galleryItems.length) % galleryItems.length;
    transitionToMemory(idx);
}

// 5. Open/Close Modal controllers
function openModal(index) {
    previouslyFocusedEl = document.activeElement;
    currentMemoryIndex = index;

    const item = galleryItems[index];
    const img = item.querySelector("img");
    const storyData = item.querySelector(".caption-card");
    if (!img || !storyData) return;

    modalImage.src = img.src;
    modalImage.alt = img.alt;

    const title = storyData.querySelector("strong").outerHTML;
    const dateText = storyData.querySelector(".caption-date").outerHTML;
    const desc = storyData.querySelector("p").outerHTML;
    modalContent.innerHTML = `
        ${title}
        ${dateText}
        <div class="modal-separator" aria-hidden="true">♥</div>
        ${desc}
        <div class="modal-counter">Memory ${index + 1} of ${galleryItems.length}</div>
    `;

    preloadAdjacent(index);
    updateModalProgressBar(index);
    updateModalDots(index);

    modalOverlay.classList.add("active");
    document.body.classList.add("modal-open");

    AudioManager.playPageTurn();
    AudioManager.triggerHaptic([60, 40, 60]);

    if (hasGsap()) {
        const rect = img.getBoundingClientRect();
        const wrapperW = modalWrapper.offsetWidth || 720;
        const wrapperH = modalWrapper.offsetHeight || 500;

        const startX = (rect.left + rect.width / 2) - window.innerWidth / 2;
        const startY = (rect.top + rect.height / 2) - window.innerHeight / 2;
        const startScaleX = rect.width / wrapperW;
        const startScaleY = rect.height / wrapperH;

        gsap.fromTo(modalWrapper,
            {
                x: startX,
                y: startY,
                scaleX: isNaN(startScaleX) || startScaleX === 0 ? 0.35 : startScaleX,
                scaleY: isNaN(startScaleY) || startScaleY === 0 ? 0.35 : startScaleY,
                opacity: 0.2
            },
            {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                duration: 0.55,
                ease: "cubic-bezier(0.22, 1, 0.36, 1)",
                clearProps: "transform"
            }
        );
    }

    setupFocusableElements();
    setTimeout(() => closeBtn.focus(), 80);
}

function closeModal() {
    AudioManager.playWhoosh();
    AudioManager.triggerHaptic(20);

    if (hasGsap()) {
        const item = galleryItems[currentMemoryIndex];
        const img = item?.querySelector("img");
        if (img) {
            const rect = img.getBoundingClientRect();
            const wrapperW = modalWrapper.offsetWidth || 720;
            const wrapperH = modalWrapper.offsetHeight || 500;

            const endX = (rect.left + rect.width / 2) - window.innerWidth / 2;
            const endY = (rect.top + rect.height / 2) - window.innerHeight / 2;
            const endScaleX = rect.width / wrapperW;
            const endScaleY = rect.height / wrapperH;

            gsap.to(modalWrapper, {
                x: endX,
                y: endY,
                scaleX: isNaN(endScaleX) || endScaleX === 0 ? 0.35 : endScaleX,
                scaleY: isNaN(endScaleY) || endScaleY === 0 ? 0.35 : endScaleY,
                opacity: 0,
                duration: 0.45,
                ease: "cubic-bezier(0.22, 1, 0.36, 1)",
                onComplete: () => {
                    modalOverlay.classList.remove("active");
                    document.body.classList.remove("modal-open");
                    gsap.set(modalWrapper, { clearProps: "all" });
                    modalImage.src = "";
                    modalImage.alt = "";
                    modalContent.innerHTML = "";
                    modalDotsContainer.innerHTML = "";
                    if (previouslyFocusedEl) {
                        previouslyFocusedEl.focus();
                    }
                }
            });
            return;
        }
    }

    modalOverlay.classList.remove("active");
    document.body.classList.remove("modal-open");
    modalImage.src = "";
    modalImage.alt = "";
    modalContent.innerHTML = "";
    modalDotsContainer.innerHTML = "";
    if (previouslyFocusedEl) {
        previouslyFocusedEl.focus();
    }
}

// 5. Focus trapping keyboard controls
function handleFocusTrap(e) {
    if (!modalOverlay.classList.contains("active")) return;
    if (e.key !== "Tab") return;

    if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
        }
    } else { // Tab
        if (document.activeElement === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
        }
    }
}

document.addEventListener("keydown", handleFocusTrap);

document.addEventListener("keydown", (e) => {
    if (!modalOverlay.classList.contains("active")) return;

    if (e.key === "Escape") {
        closeModal();
    } else if (e.key === "ArrowRight") {
        showNextMemory();
    } else if (e.key === "ArrowLeft") {
        showPrevMemory();
    }
});

// 6. Mobile Swipe gesture bindings
let touchStartX = 0;
let touchEndX = 0;

modalWrapper.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

modalWrapper.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 55;
    if (touchEndX < touchStartX - threshold) {
        showNextMemory();
    } else if (touchEndX > touchStartX + threshold) {
        showPrevMemory();
    }
}, { passive: true });

// 7. Grid items event bindings
galleryItems.forEach((item, index) => {
    const img = item.querySelector("img");
    const storyData = item.querySelector(".caption-card");
    if (!img || !storyData) return;

    item.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(index);
    });

    item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            openModal(index);
        }
    });
});

closeBtn.addEventListener("click", closeModal);
prevBtn.addEventListener("click", showPrevMemory);
nextBtn.addEventListener("click", showNextMemory);
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Story Memory Book Accordion Logic
const openMemoryBookBtn = document.getElementById("openMemoryBookBtn");
const storyAccordion = document.getElementById("storyAccordion");
const storyConclusion = document.getElementById("storyConclusion");
const joinSayIDoBtn = document.getElementById("joinSayIDoBtn");

function updateStoryProgress(activeChapter) {
    const desktopSteps = document.querySelectorAll(".story-nav-step");
    const mobileSteps = document.querySelectorAll(".mobile-nav-step");

    desktopSteps.forEach(step => {
        const ch = parseInt(step.getAttribute("data-chapter"), 10);
        step.classList.remove("active", "completed");
        if (ch === activeChapter) {
            step.classList.add("active");
        } else if (ch < activeChapter) {
            step.classList.add("completed");
        }
    });

    mobileSteps.forEach(step => {
        const ch = parseInt(step.getAttribute("data-chapter"), 10);
        step.classList.remove("active", "completed");
        if (ch === activeChapter) {
            step.classList.add("active");
        } else if (ch < activeChapter) {
            step.classList.add("completed");
        }
    });

    const percent = ((activeChapter - 1) / 3) * 100;
    const desktopLine = document.querySelector(".story-nav-line-progress");
    const mobileLine = document.querySelector(".mobile-nav-line-progress");
    if (desktopLine) desktopLine.style.height = `${percent}%`;
    if (mobileLine) mobileLine.style.width = `${percent}%`;
}

function setupProgressNavClickEvents() {
    const navSteps = document.querySelectorAll(".story-nav-step, .mobile-nav-step");
    navSteps.forEach(step => {
        step.addEventListener("click", (e) => {
            e.stopPropagation();
            const chNum = parseInt(step.getAttribute("data-chapter"), 10);
            const targetCard = document.getElementById(`chapter${chNum}`);
            if (targetCard) {
                if (targetCard.classList.contains("collapsed")) {
                    const header = targetCard.querySelector(".card-header");
                    header.click();
                } else {
                    const header = targetCard.querySelector(".card-header");
                    const headerRect = header.getBoundingClientRect();
                    const targetY = window.scrollY + headerRect.top - 80;
                    const obj = { y: window.scrollY };
                    if (hasGsap()) {
                        gsap.to(obj, {
                            y: targetY,
                            duration: 0.6,
                            ease: "power2.out",
                            onUpdate: () => window.scrollTo(0, obj.y)
                        });
                    } else {
                        window.scrollTo({ top: targetY, behavior: "smooth" });
                    }
                }
                updateStoryProgress(chNum);
            }
        });
    });
}

if (openMemoryBookBtn && storyAccordion) {
    openMemoryBookBtn.addEventListener("click", () => {
        // Unlock audio context and play page-turn sound with haptics
        AudioManager.init();
        AudioManager.playPageTurn();
        AudioManager.triggerHaptic([60, 40, 60]);

        setupProgressNavClickEvents();

        const revealComplete = () => {
            document.getElementById("storyNavDesktop")?.classList.add("visible");
            if (window.ScrollTrigger) ScrollTrigger.refresh();

            // Activate all premium features
            showReadingProgress(true);
            setupAllTransitionCards();
            setupCaptionDateFade();
            setupGoldDividerDraw();

            // Final moment plays as a scroll-triggered event below
            // Set up intersection observer for the final moment panel
            const finalPanel = document.getElementById("storyConclusion");
            if (finalPanel) {
                const finalObs = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            playFinalMomentTimeline();
                            finalObs.disconnect();
                        }
                    });
                }, { threshold: 0.2 });
                finalObs.observe(finalPanel);
            }
        };

        if (hasGsap()) {
            gsap.timeline()
                .to(".gallery-intro-card", {
                    opacity: 0,
                    y: -30,
                    duration: 0.5,
                    onComplete: () => {
                        document.querySelector(".gallery-intro-card").style.display = "none";
                        storyAccordion.style.display = "block";
                        storyConclusion.style.display = "block";
                    }
                })
                .fromTo(storyAccordion, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
                .eventCallback("onComplete", revealComplete);
        } else {
            document.querySelector(".gallery-intro-card").style.display = "none";
            storyAccordion.style.display = "block";
            storyConclusion.style.display = "block";
            revealComplete();
        }
    });
}


// =============================================================================
// MODULE 10: READING PROGRESS BAR
// =============================================================================

const progressBar = document.getElementById("storyReadingProgress");
const progressFill = document.getElementById("storyReadingProgressFill");

function updateReadingProgress() {
    if (!progressBar || !storyAccordion) return;
    const accordion = storyAccordion;
    const accordionTop = accordion.getBoundingClientRect().top + window.scrollY;
    const accordionHeight = accordion.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrolled = window.scrollY + viewportHeight - accordionTop;
    const total = accordionHeight + viewportHeight;
    const pct = Math.max(0, Math.min(100, (scrolled / total) * 100));
    if (progressFill) progressFill.style.width = pct + "%";
}

function showReadingProgress(show) {
    if (!progressBar) return;
    if (show) {
        progressBar.classList.add("active");
        window.addEventListener("scroll", updateReadingProgress, { passive: true });
    } else {
        progressBar.classList.remove("active");
        window.removeEventListener("scroll", updateReadingProgress);
    }
}

// =============================================================================
// MODULE 11: CHAPTER TRANSITION CARD — OBSERVER-BASED ANIMATIONS
// =============================================================================

function setupTransitionCard(card) {
    const dividers = card.querySelectorAll(".transition-divider");
    const quote = card.querySelector(".transition-quote");
    const continueBtn = card.querySelector(".transition-continue-btn");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 1. Draw the top divider
                if (dividers[0]) dividers[0].classList.add("drawn");
                // 2. Fade quote in after 400ms
                setTimeout(() => { if (quote) quote.classList.add("visible"); }, 400);
                // 3. Draw the bottom divider after 700ms
                setTimeout(() => { if (dividers[1]) dividers[1].classList.add("drawn"); }, 700);
                // 4. Fade continue button in after 1000ms
                setTimeout(() => { if (continueBtn) continueBtn.classList.add("visible"); }, 1000);
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });
    observer.observe(card);
}

function setupAllTransitionCards() {
    document.querySelectorAll(".chapter-transition-card").forEach(setupTransitionCard);

    // Continue button handlers
    document.querySelectorAll(".transition-continue-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const nextChNum = parseInt(btn.getAttribute("data-next-chapter"), 10);
            const nextCard = document.getElementById(`chapter${nextChNum}`);
            if (!nextCard) return;
            // Trigger the header click to expand the next chapter
            const nextHeader = nextCard.querySelector(".card-header");
            if (nextHeader) nextHeader.click();
        });
    });
}

// =============================================================================
// MODULE 13: PHOTO TILT MICRO-INTERACTION
// =============================================================================

const TILT_MAX = 6; // degrees

function enablePhotoTilt(container) {
    const imgEl = container.querySelector("img");
    if (!imgEl) return;

    container.addEventListener("mousemove", (e) => {
        const rect = container.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotateX = (-dy * TILT_MAX).toFixed(2);
        const rotateY = (dx * TILT_MAX).toFixed(2);
        imgEl.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        imgEl.style.transition = "transform 0.1s linear";
    });

    container.addEventListener("mouseleave", () => {
        imgEl.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
        imgEl.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    });
}

function setupPhotoTilt() {
    // Only on non-touch devices
    if (window.matchMedia("(hover: none)").matches) return;
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".story-img-wrap").forEach(enablePhotoTilt);
}

// =============================================================================
// MODULE 13B: CAPTION DATE FADE & GOLD DIVIDER DRAW — INTERSECTION OBSERVERS
// =============================================================================

function setupCaptionDateFade() {
    const dateEls = document.querySelectorAll(".caption-date");
    if (!dateEls.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    dateEls.forEach(el => obs.observe(el));
}

function setupGoldDividerDraw() {
    const lines = document.querySelectorAll(".chapter-closing-line");
    if (!lines.length) return;
    lines.forEach(line => {
        // Reset to 0 width for draw effect
        line.style.width = "0";
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate width to 100% via style
                    requestAnimationFrame(() => {
                        line.style.width = "100%";
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        obs.observe(line);
    });
}

// =============================================================================
// MODULE 15: FINAL MOMENT — CINEMATIC REVEAL TIMELINE
// =============================================================================

function playFinalMomentTimeline() {
    const panel = document.getElementById("storyConclusion");
    if (!panel) return;

    const dividers = panel.querySelectorAll(".final-moment-divider");
    const line1 = panel.querySelector(".final-moment-line-1");
    const line2 = panel.querySelector(".final-moment-line-2");
    const cta = document.getElementById("finalMomentCta");

    if (hasGsap()) {
        const tl = gsap.timeline({ delay: 0.2 });
        tl
            .to(dividers, { opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" })
            .to(line1, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4")
            .to(line2, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
            // Adjusted cinematic pause for a snappier flow
            .to({}, { duration: 1.2 })
            .to(cta, { opacity: 1, y: 0, duration: 0.7, ease: "cubic-bezier(0.22, 1, 0.36, 1)" });
    } else {
        // Fallback: simple CSS transitions
        dividers.forEach(d => { d.style.opacity = "1"; });
        if (line1) line1.style.opacity = "1";
        if (line2) line2.style.opacity = "1";
        setTimeout(() => { if (cta) cta.style.opacity = "1"; }, 1500);
    }
}

// Accordion Expand/Collapse Logic
const storyCards = document.querySelectorAll(".story-card");
storyCards.forEach(card => {
    const header = card.querySelector(".card-header");
    const body = card.querySelector(".card-body");

    const toggleAccordion = () => {
        const isExpanded = !card.classList.contains("collapsed");

        // Collapse all cards first
        storyCards.forEach(c => {
            c.classList.add("collapsed");
            c.classList.remove("expanded");
            c.querySelector(".card-body").style.maxHeight = null;
        });

        if (!isExpanded) {
            // Expand the clicked card and play premium shimmer with haptics
            AudioManager.playShimmer();
            AudioManager.triggerHaptic(40);

            card.classList.remove("collapsed");
            card.classList.add("expanded");
            body.style.maxHeight = body.scrollHeight + "px";

            const chNum = parseInt(card.id.replace("chapter", ""), 10);
            updateStoryProgress(chNum);

            // Cinematic hero image clip-path reveal - accelerated
            setTimeout(() => {
                card.querySelectorAll(".layout-hero-side .story-img-wrap img").forEach((img, i) => {
                    img.style.clipPath = "inset(0 100% 0 0)";
                    img.style.transition = "none";
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            img.style.transition = "clip-path 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
                            img.style.clipPath = "inset(0 0% 0 0)";
                        }, i * 100);
                    });
                });
            }, 50);

            // Enable tilt for newly-visible images in this card
            if (!window.matchMedia("(hover: none)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                setTimeout(() => {
                    card.querySelectorAll(".story-img-wrap").forEach(enablePhotoTilt);
                }, 250);
            }

            // Scroll card header into viewport smoothly - responsive timing
            setTimeout(() => {
                const headerRect = header.getBoundingClientRect();
                const targetY = window.scrollY + headerRect.top - 80;
                const obj = { y: window.scrollY };
                if (hasGsap()) {
                    gsap.to(obj, {
                        y: targetY,
                        duration: 0.4,
                        ease: "power2.out",
                        onUpdate: () => window.scrollTo(0, obj.y)
                    });
                } else {
                    window.scrollTo({ top: targetY, behavior: "smooth" });
                }
            }, 200);
        }

        // Refresh ScrollTrigger parameters
        setTimeout(() => {
            if (window.ScrollTrigger) ScrollTrigger.refresh();
        }, 450);
    };

    header.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleAccordion();
    });

    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleAccordion();
        }
    });
});

// Final transition scroll down
if (joinSayIDoBtn) {
    joinSayIDoBtn.addEventListener("click", () => {
        const target = document.getElementById("countdown");
        if (!target) return;
        if (hasGsap()) {
            const targetPos = target.getBoundingClientRect().top + window.scrollY;
            const obj = { y: window.scrollY };
            gsap.to(obj, {
                y: targetPos,
                duration: 1.4,
                ease: "cubic-bezier(0.22, 1, 0.36, 1)",
                onUpdate: () => window.scrollTo(0, obj.y)
            });
        } else {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
}

// Cinematic Section ScrollTrigger Animations
if (hasGsap() && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Parallax
    gsap.to(".hero-image", {
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        yPercent: 12,
        ease: "none"
    });

    // 2. Story Section responsive animations
    const mm = gsap.matchMedia();

    // 2. Story Section Cinematic Quote & Paragraph Reveal Sequence
    (() => {
        const storySection = document.getElementById("story");
        if (!storySection) return;

        const memories = gsap.utils.toArray("#story .memory-item");
        const quotesContainer = storySection.querySelector(".story-copy-quotes");
        const storyParagraphs = storySection.querySelector(".story-paragraphs");
        const storyPhoto = storySection.querySelector(".story-photo");
        const sectionHeading = storySection.querySelector(".section-heading");

        if (!hasGsap() || memories.length === 0) {
            if (storyParagraphs) storyParagraphs.style.opacity = "1";
            return;
        }

        // Initialize element states
        gsap.set(memories, { opacity: 0, y: 15 });
        if (storyParagraphs) {
            gsap.set(storyParagraphs, { opacity: 0, y: 25, display: "none" });
        }

        const mainTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#story",
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });

        // 1. Reveal Section Heading
        if (sectionHeading) {
            mainTl.fromTo(sectionHeading.children,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            );
        }

        // 2. Reveal Story Image
        if (storyPhoto) {
            mainTl.fromTo(storyPhoto,
                { opacity: 0, scale: 0.96 },
                { opacity: 1, scale: 1.0, duration: 0.8, ease: "power2.out" },
                "-=0.3"
            );

            // Ambient Ken Burns slow scale on story image
            gsap.fromTo("#storyImage",
                { scale: 1.0 },
                { scale: 1.04, duration: 25, ease: "none", repeat: -1, yoyo: true }
            );
        }

        // 3. Cinematic Quote Sequence (ONE quote at a time in chronological order)
        memories.forEach((quote, index) => {
            // Fade In Quote
            mainTl.to(quote, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out"
            });

            // Hold Visible (2.8 seconds)
            mainTl.to({}, { duration: 2.8 });

            // Fade Out Quote
            mainTl.to(quote, {
                opacity: 0,
                y: -15,
                duration: 0.7,
                ease: "power2.in"
            });
        });

        // 4. Smoothly collapse & fade out quote container
        if (quotesContainer) {
            mainTl.to(quotesContainer, {
                opacity: 0,
                height: 0,
                marginTop: 0,
                marginBottom: 0,
                duration: 0.7,
                ease: "power2.inOut",
                onComplete: () => {
                    quotesContainer.style.display = "none";
                }
            });
        }

        // 5. Fade in Story Paragraph(s)
        if (storyParagraphs) {
            mainTl.call(() => {
                storyParagraphs.style.display = "flex";
            });
            mainTl.to(storyParagraphs, {
                opacity: 1,
                y: 0,
                duration: 1.0,
                ease: "power2.out"
            }, "+=0.1");

            const paragraphs = storyParagraphs.querySelectorAll("p");
            if (paragraphs.length > 0) {
                mainTl.fromTo(paragraphs,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power2.out" },
                    "-=0.8"
                );
            }
        }
    })();

    // Fade-in divider quote
    gsap.from(".story-divider", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        scrollTrigger: {
            trigger: ".story-divider",
            start: "top 92%"
        }
    });

    // 3. Gallery Section Timeline (Editorial Intro Reveal)
    const galleryTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#gallery",
            start: "top 85%"
        }
    });
    galleryTimeline
        .from(".gallery-intro-card > *", {
            y: 25,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        });

    // 3b. Gallery Section ScrollTriggers for Progress Navigator
    ScrollTrigger.create({
        trigger: "#gallery",
        start: "top 20%",
        end: "bottom 80%",
        onEnter: () => {
            if (document.getElementById("storyAccordion").style.display !== "none") {
                document.getElementById("storyNavDesktop")?.classList.add("visible");
            }
        },
        onLeave: () => document.getElementById("storyNavDesktop")?.classList.remove("visible"),
        onEnterBack: () => {
            if (document.getElementById("storyAccordion").style.display !== "none") {
                document.getElementById("storyNavDesktop")?.classList.add("visible");
            }
        },
        onLeaveBack: () => document.getElementById("storyNavDesktop")?.classList.remove("visible")
    });

    const cards = document.querySelectorAll(".story-card");
    cards.forEach(card => {
        const chNum = parseInt(card.id.replace("chapter", ""), 10);
        ScrollTrigger.create({
            trigger: card,
            start: "top 40%",
            end: "bottom 40%",
            onEnter: () => updateStoryProgress(chNum),
            onEnterBack: () => updateStoryProgress(chNum)
        });
    });

    // 4. Countdown Section Timeline
    const countdownTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#countdown",
            start: "top 85%"
        }
    });
    countdownTimeline
        .from("#countdown .section-heading > *", {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        })
        .from("#countdown .time-box", {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        }, "-=0.3")
        .from("#countdown .countdown-divider", {
            scaleY: 0,
            opacity: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out"
        }, "-=0.5");

    // 5. Events Section Timeline
    const eventsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#events",
            start: "top 85%"
        }
    });
    eventsTimeline
        .from("#events .section-heading > *", {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        })
        .from("#events .event-card", {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        }, "-=0.3");

    // Timeline active thread progress drawing
    gsap.to(".timeline-thread-progress", {
        height: "100%",
        scrollTrigger: {
            trigger: ".timeline-container",
            start: "top 70%",
            end: "bottom 70%",
            scrub: true
        },
        ease: "none"
    });

    // Timeline dots activation trigger
    document.querySelectorAll(".event-card").forEach(card => {
        const dot = card.querySelector(".timeline-dot");
        if (dot) {
            ScrollTrigger.create({
                trigger: card,
                start: "top 70%",
                onEnter: () => dot.classList.add("active"),
                onLeaveBack: () => dot.classList.remove("active")
            });
        }
    });

    // 6. Venue Section Timeline
    gsap.from("#venue .venue-panel", {
        scrollTrigger: {
            trigger: "#venue",
            start: "top 85%"
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        onComplete: () => {
            // Draw the route line on the map - faster
            gsap.fromTo("#venue .route-line",
                { strokeDasharray: 100, strokeDashoffset: 100 },
                { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" }
            );
            // Pulse ring reveal
            gsap.to("#venue .map-pulse-ring", { opacity: 0.9, duration: 0.4, delay: 0.7 });
        }
    });


    // 7. RSVP Section Timeline
    const rsvpTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#rsvp",
            start: "top 85%"
        }
    });
    rsvpTimeline
        .from("#rsvp .section-heading > *", {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out"
        })
        .from("#rsvp .rsvp-form", {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out"
        }, "-=0.3");

    // 8. Footer Section Timeline
    gsap.from("#footer .footer-content > *", {
        scrollTrigger: {
            trigger: "#footer",
            start: "top 90%"
        },
        y: 25,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        onComplete: () => {
            // Draw cursive signatures paths - faster and synchronized
            gsap.to("#footer .sig-rozar", { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut" });
            gsap.to("#footer .sig-heart", { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut", delay: 0.7 });
            gsap.to("#footer .sig-arifa", { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut", delay: 0.9 });
        }
    });

    // Translate moon background on scroll
    gsap.to(".background .moon", {
        y: 100,
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        },
        ease: "none"
    });
}

// Dynamic Floating Gold Particles Generator
function createFloatingParticles() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bgContainer = document.querySelector(".background");
    if (!bgContainer) return;

    const particleCount = 14;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "floating-petal";

        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.bottom = `-${Math.random() * 20 + 10}px`;

        const size = Math.random() * 8 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.opacity = Math.random() * 0.45 + 0.15;
        particle.style.animationDelay = `${Math.random() * 12}s`;
        particle.style.animationDuration = `${Math.random() * 18 + 18}s`;

        bgContainer.appendChild(particle);
    }
}

// ==========================================================================
// RSVP WIZARD & GUEST EXPERIENCE
// ==========================================================================
const rsvpSteps = document.querySelectorAll(".rsvp-step");
const rsvpProgressFill = document.querySelector(".rsvp-progress-fill");
const rsvpProgressDots = document.querySelectorAll(".rsvp-progress-dot");

const nameInput = rsvpForm?.querySelector('input[name="name"]');
const attendanceSelect = rsvpForm?.querySelector('select[name="attendance"]');
const guestsInput = rsvpForm?.querySelector('input[name="guests"]');
const messageTextarea = rsvpForm?.querySelector('textarea[name="message"]');

const nameError = document.getElementById("nameError");
const attendanceError = document.getElementById("attendanceError");
const guestsError = document.getElementById("guestsError");

const summaryName = document.getElementById("summaryName");
const summaryAttendance = document.getElementById("summaryAttendance");
const summaryGuests = document.getElementById("summaryGuests");
const summaryMessage = document.getElementById("summaryMessage");
const summaryGuestsRow = document.getElementById("summaryGuestsRow");

const rsvpLoadingState = document.querySelector(".rsvp-loading-state");
const rsvpSuccessState = document.querySelector(".rsvp-success-state");
const rsvpFailureState = document.querySelector(".rsvp-failure-state");
const successPersonalMessage = document.getElementById("successPersonalMessage");

const googleCalendarLink = document.getElementById("googleCalendarLink");
const outlookCalendarLink = document.getElementById("outlookCalendarLink");
const microsoft365CalendarLink = document.getElementById("microsoft365CalendarLink");
const downloadIcsBtn = document.getElementById("downloadIcsBtn");
const retrySubmitBtn = document.getElementById("retrySubmitBtn");

let rsvpActiveStep = 1;
let rsvpIsSubmitting = false;

// 1. Wizard Navigation & Skips
function updateRsvpProgress(step) {
    let percent = 0;
    if (step === 1) percent = 0;
    else if (step === 2) percent = 50;
    else if (step === 3 || step === 4) percent = 100;

    if (rsvpProgressFill) {
        rsvpProgressFill.style.width = `${percent}%`;
    }

    rsvpProgressDots.forEach(dot => {
        const dotStep = parseInt(dot.getAttribute("data-step"), 10);
        if (dotStep < step) {
            dot.classList.add("completed");
            dot.classList.remove("active");
        } else if (dotStep === step) {
            dot.classList.add("active");
            dot.classList.remove("completed");
        } else {
            dot.classList.remove("active", "completed");
        }
    });
}

function transitionToRsvpStep(step) {
    rsvpActiveStep = step;
    rsvpSteps.forEach(slide => {
        const slideStep = parseInt(slide.getAttribute("data-step"), 10);
        if (slideStep === step) {
            slide.classList.add("active");
            const firstInput = slide.querySelector("input, select, textarea, button");
            setTimeout(() => firstInput?.focus(), 80);
        } else {
            slide.classList.remove("active");
        }
    });

    updateRsvpProgress(step);
}

// 2. Real-time Input Validation Helpers
function validateName() {
    const val = (nameInput?.value || "").trim();
    if (!val) {
        nameError.textContent = "Please enter your name.";
        nameInput?.classList.add("invalid-field");
        return false;
    } else if (val.length < 2) {
        nameError.textContent = "Name must be at least 2 characters.";
        nameInput?.classList.add("invalid-field");
        return false;
    } else {
        nameError.textContent = "";
        nameInput?.classList.remove("invalid-field");
        return true;
    }
}

function validateAttendance() {
    const val = attendanceSelect?.value || "";
    if (!val) {
        attendanceError.textContent = "Please select your attendance.";
        attendanceSelect?.classList.add("invalid-field");
        return false;
    } else {
        attendanceError.textContent = "";
        attendanceSelect?.classList.remove("invalid-field");
        return true;
    }
}

function validateGuests() {
    const isAttending = attendanceSelect?.value === "Yes, I'll be there";
    if (!isAttending) return true;

    const val = parseInt(guestsInput?.value || "", 10);
    if (isNaN(val) || val < 1 || val > 20) {
        guestsError.textContent = "Number of guests must be between 1 and 20.";
        guestsInput?.classList.add("invalid-field");
        return false;
    } else {
        guestsError.textContent = "";
        guestsInput?.classList.remove("invalid-field");
        return true;
    }
}

nameInput?.addEventListener("blur", validateName);
nameInput?.addEventListener("input", validateName);
attendanceSelect?.addEventListener("change", () => {
    validateAttendance();
    const isAttending = attendanceSelect.value === "Yes, I'll be there";
    const guestLabel = document.getElementById("guestFieldLabel");
    if (isAttending) {
        guestLabel?.style.setProperty("display", "flex");
        if (!guestsInput.value) guestsInput.value = 1;
        guestsInput.classList.add("has-value");
    } else {
        guestLabel?.style.setProperty("display", "none");
        guestsInput.value = "";
        guestsInput.classList.remove("has-value");
    }
});
guestsInput?.addEventListener("blur", validateGuests);
guestsInput?.addEventListener("input", validateGuests);

// 3. Step buttons navigators
rsvpForm?.querySelectorAll(".next-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (rsvpActiveStep === 1) {
            const isNameValid = validateName();
            const isAttendanceValid = validateAttendance();
            if (isNameValid && isAttendanceValid) {
                const isAttending = attendanceSelect.value === "Yes, I'll be there";
                if (isAttending) {
                    transitionToRsvpStep(2);
                } else {
                    guestsInput.value = "";
                    buildSummary();
                    transitionToRsvpStep(3);
                }
            }
        } else if (rsvpActiveStep === 2) {
            if (validateGuests()) {
                buildSummary();
                transitionToRsvpStep(3);
            }
        }
    });
});

rsvpForm?.querySelectorAll(".prev-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (rsvpActiveStep === 3) {
            const isAttending = attendanceSelect.value === "Yes, I'll be there";
            if (isAttending) {
                transitionToRsvpStep(2);
            } else {
                transitionToRsvpStep(1);
            }
        } else if (rsvpActiveStep === 2) {
            transitionToRsvpStep(1);
        }
    });
});

// 4. Summary Review Loader
function buildSummary() {
    summaryName.textContent = (nameInput?.value || "").trim();
    summaryAttendance.textContent = attendanceSelect?.value || "";

    const isAttending = attendanceSelect?.value === "Yes, I'll be there";
    if (isAttending) {
        summaryGuestsRow?.style.setProperty("display", "list-item");
        summaryGuests.textContent = guestsInput?.value || "1";
    } else {
        summaryGuestsRow?.style.setProperty("display", "none");
        summaryGuests.textContent = "0";
    }

    const wish = (messageTextarea?.value || "").trim();
    summaryMessage.textContent = wish ? wish : "No message left.";
}

// Helper to escape iCalendar special characters
function escapeIcsText(str) {
    if (!str) return "";
    return str
        .replace(/\\/g, "\\\\")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "");
}

// Helper to fold long lines to 75 characters (RFC 5545)
function foldLine(line) {
    if (line.length <= 75) return line;
    let result = line.slice(0, 75);
    let remaining = line.slice(75);
    while (remaining.length > 0) {
        result += "\r\n ";
        result += remaining.slice(0, 74);
        remaining = remaining.slice(74);
    }
    return result;
}

// 5. Calendar Links & Downloads
function setupCalendarIntegrations(name, attendance) {
    const calendarHeading = document.querySelector(".calendar-heading");
    const calendarButtonsDiv = document.querySelector(".calendar-buttons");

    if (!settings || !settings.groomShortName || !settings.brideShortName) {
        console.error("Missing wedding settings event details.");
        if (calendarHeading) {
            calendarHeading.textContent = "Calendar integration is unavailable: groom or bride names are missing in settings.";
            calendarHeading.style.color = "#ff4d4d";
        }
        if (calendarButtonsDiv) {
            calendarButtonsDiv.style.display = "none";
        }
        return;
    }

    const dateObj = new Date(nikahEventForTimer ? nikahEventForTimer.date : "2026-08-30T09:00:00+05:30");
    if (isNaN(dateObj.getTime())) {
        console.error("Invalid event date configured.");
        if (calendarHeading) {
            calendarHeading.textContent = "Calendar integration is unavailable: wedding date is invalid or missing.";
            calendarHeading.style.color = "#ff4d4d";
        }
        if (calendarButtonsDiv) {
            calendarButtonsDiv.style.display = "none";
        }
        return;
    }

    const dateEndObj = new Date(dateObj.getTime() + 6 * 60 * 60 * 1000); // 6 hours event window
    const primaryVenue = settings.venues?.[0];

    const isAttending = attendance === "Yes, I'll be there";
    if (isAttending) {
        const formattedDate = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
        successPersonalMessage.textContent = `Thank you, ${name}! We are thrilled that you will celebrate with us on ${formattedDate}.`;
        document.querySelector(".rsvp-calendar-wrapper")?.style.setProperty("display", "block");
        if (calendarHeading) {
            calendarHeading.textContent = "Add this celebration to your calendar:";
            calendarHeading.style.color = "";
        }
        if (calendarButtonsDiv) {
            calendarButtonsDiv.style.display = "flex";
        }
    } else {
        successPersonalMessage.textContent = `Thank you for letting us know, ${name}. We will miss you, but we appreciate you sending your blessings!`;
        document.querySelector(".rsvp-calendar-wrapper")?.style.setProperty("display", "none");
    }

    const toUtcStr = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const startUtc = toUtcStr(dateObj);
    const endUtc = toUtcStr(dateEndObj);
    const currentUtc = toUtcStr(new Date());

    const toOutlookUtcStr = (d) => d.toISOString().split('.')[0] + 'Z';

    const rawTitle = `${settings.groomShortName} & ${settings.brideShortName}'s Wedding (Nikah)`;
    const rawLocation = primaryVenue
        ? `${primaryVenue.name}, ${primaryVenue.address}, ${primaryVenue.city}, ${primaryVenue.state}`
        : "NSK & NKR A/C Mahal and Residency, Madurai, Tamil Nadu";

    const siteUrl = window.location.origin;
    const mapsUrl = primaryVenue?.googleMapsUrl || "https://maps.google.com";

    const rawDetails = `You are cordially invited to celebrate the wedding of ${settings.groomShortName} & ${settings.brideShortName}.\n\n` +
        `Venue: ${primaryVenue?.name || "NSK & NKR A/C Mahal"}\n` +
        `Address: ${primaryVenue?.address || "GST Main Rd, Lion City"}, ${primaryVenue?.city || "Madurai"}, ${primaryVenue?.state || "Tamil Nadu"}\n\n` +
        `Wedding Website: ${siteUrl}\n` +
        `Google Maps Link: ${mapsUrl}`;

    // Google Calendar
    if (googleCalendarLink) {
        const googleParams = new URLSearchParams({
            action: "TEMPLATE",
            text: rawTitle,
            dates: `${startUtc}/${endUtc}`,
            details: rawDetails,
            location: rawLocation
        });
        googleCalendarLink.href = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;
    }

    // Outlook & Microsoft 365
    const outlookParams = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        subject: rawTitle,
        startdt: toOutlookUtcStr(dateObj),
        enddt: toOutlookUtcStr(dateEndObj),
        body: rawDetails,
        location: rawLocation
    });

    if (outlookCalendarLink) {
        outlookCalendarLink.href = `https://outlook.live.com/calendar/deeplink/compose?${outlookParams.toString()}`;
    }

    if (microsoft365CalendarLink) {
        microsoft365CalendarLink.href = `https://outlook.office.com/calendar/deeplink/compose?${outlookParams.toString()}`;
    }

    // Apple / iOS .ics download
    if (downloadIcsBtn) {
        downloadIcsBtn.onclick = async () => {
            const icsLines = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Project RA//Wedding Invitation//EN",
                "CALSCALE:GREGORIAN",
                "METHOD:PUBLISH",
                "BEGIN:VEVENT",
                `UID:wedding-${settings.groomShortName.toLowerCase()}-${settings.brideShortName.toLowerCase()}-2026@project-ra.com`,
                `DTSTAMP:${currentUtc}`,
                `DTSTART:${startUtc}`,
                `DTEND:${endUtc}`,
                `SUMMARY:${escapeIcsText(rawTitle)}`,
                `DESCRIPTION:${escapeIcsText(rawDetails)}`,
                `LOCATION:${escapeIcsText(rawLocation)}`,
                "END:VEVENT",
                "END:VCALENDAR"
            ];

            const foldedLines = icsLines.map(line => foldLine(line));
            const icsContent = foldedLines.join("\r\n");

            const filename = `wedding-${settings.groomShortName.toLowerCase()}-${settings.brideShortName.toLowerCase()}.ics`;
            const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });

            // On modern mobile devices (especially iOS Safari), use navigator.share if available
            if (navigator.share && navigator.canShare) {
                try {
                    const file = new File([blob], filename, { type: "text/calendar" });
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: rawTitle,
                            text: rawDetails
                        });
                        return;
                    }
                } catch (shareError) {
                    console.warn("navigator.share failed, falling back to download link", shareError);
                }
            }

            // Desktop and fallback download link
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        };
    }
}

// 6. Submit RSVP Fetch Operations
async function executeRsvpSubmission() {
    if (rsvpIsSubmitting) return;
    rsvpIsSubmitting = true;

    transitionToRsvpStep(4);

    rsvpLoadingState.style.setProperty("display", "flex");
    rsvpSuccessState.style.setProperty("display", "none");
    rsvpFailureState.style.setProperty("display", "none");

    document.querySelector(".rsvp-progress-tracker")?.style.setProperty("display", "none");

    const formData = new FormData(rsvpForm);
    const name = String(formData.get("name") || "").trim();
    const attendance = String(formData.get("attendance") || "");

    try {
        const response = await fetch("https://formsubmit.co/arifabivikhan@gmail.com", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server error");

        // Dynamically log to admin guest management
        if (typeof registerNewRSVPSubmission === "function") {
            registerNewRSVPSubmission(name, attendance, formData.get("guests") || 1, formData.get("message") || "");
        }

        // Post message to parent window (Vite/React app) to update Firestore / central database
        if (window.parent) {
            window.parent.postMessage({
                type: 'RSVP_SUBMIT',
                payload: {
                    name: name,
                    attendance: attendance,
                    guestsCount: formData.get("guests") || 1,
                    message: formData.get("message") || ""
                }
            }, '*');
        }

        localStorage.setItem("rsvpSubmitted", "true");
        localStorage.setItem("rsvpGuestName", name);
        localStorage.setItem("rsvpGuestAttendance", attendance);

        rsvpLoadingState.style.setProperty("display", "none");
        rsvpSuccessState.style.setProperty("display", "flex");

        // Play success chime and premium double vibration pulse
        AudioManager.playChime();
        AudioManager.triggerHaptic([80, 50, 80, 50, 120]);

        const seal = document.querySelector(".rsvp-wax-seal");
        if (seal) {
            seal.classList.add("stamp-active");
        }
        setupCalendarIntegrations(name, attendance);
    } catch (error) {
        console.error("Submission failed:", error);
        rsvpLoadingState.style.setProperty("display", "none");
        rsvpFailureState.style.setProperty("display", "flex");
    } finally {
        rsvpIsSubmitting = false;
    }
}

rsvpForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    executeRsvpSubmission();
});

retrySubmitBtn?.addEventListener("click", executeRsvpSubmission);

// 7. Duplicate Submission Lock Check on Page Load
window.addEventListener("load", () => {
    const isSubmitted = localStorage.getItem("rsvpSubmitted");
    if (isSubmitted === "true") {
        const name = localStorage.getItem("rsvpGuestName") || "Guest";
        const attendance = localStorage.getItem("rsvpGuestAttendance") || "Yes, I'll be there";

        transitionToRsvpStep(4);
        document.querySelector(".rsvp-progress-tracker")?.style.setProperty("display", "none");
        rsvpLoadingState.style.setProperty("display", "none");
        rsvpSuccessState.style.setProperty("display", "flex");
        rsvpFailureState.style.setProperty("display", "none");
        setupCalendarIntegrations(name, attendance);

        const seal = document.querySelector(".rsvp-wax-seal");
        if (seal) {
            seal.classList.add("stamp-active");
        }
    }
});

// ==========================================================================
// NAVIGATION OVERHAUL DYNAMICS
// ==========================================================================
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.getElementById("primary-nav");
const headerNavLinks = document.querySelectorAll("#primary-nav a");
const readingProgressBar = document.getElementById("readingProgress");

// 1. Reading Progress Bar & Header Show/Hide on Scroll
let lastScrollPosition = window.scrollY;
let isHeaderHidden = false;
let isMenuOpen = false;

function handleScrollDynamics() {
    const currentScrollPosition = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Update reading progress bar
    const scrollPercentage = documentHeight > 0 ? (currentScrollPosition / documentHeight) * 100 : 0;
    if (readingProgressBar) {
        if (hasGsap()) {
            gsap.to(readingProgressBar, { width: `${scrollPercentage}%`, duration: 0.1, overwrite: "auto" });
        } else {
            readingProgressBar.style.width = `${scrollPercentage}%`;
        }
    }

    // Toggle frosted glass background class
    if (currentScrollPosition > 50) {
        siteHeader?.classList.add("scrolled");
    } else {
        siteHeader?.classList.remove("scrolled");
    }

    // Header hide on scroll down, show on scroll up using smooth GSAP
    if (siteHeader && !isMenuOpen) {
        const headerHeight = siteHeader.offsetHeight;
        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > headerHeight + 100) {
            // Scrolling Down -> Hide
            if (!isHeaderHidden) {
                isHeaderHidden = true;
                if (hasGsap()) {
                    gsap.to(siteHeader, { yPercent: -108, duration: 0.4, ease: "power2.out" });
                } else {
                    siteHeader.style.transform = "translateY(-108%)";
                }
            }
        } else if (currentScrollPosition < lastScrollPosition) {
            // Scrolling Up -> Show
            if (isHeaderHidden) {
                isHeaderHidden = false;
                if (hasGsap()) {
                    gsap.to(siteHeader, { yPercent: 0, duration: 0.4, ease: "power2.out" });
                } else {
                    siteHeader.style.transform = "translateY(0)";
                }
            }
        }
    }

    lastScrollPosition = currentScrollPosition;
}

window.addEventListener("scroll", handleScrollDynamics, { passive: true });
handleScrollDynamics(); // Initial invocation

// 2. Active Section Highlight Indicator in View
const navObservedSections = document.querySelectorAll("section[id]");
const observerOptions = {
    root: null,
    rootMargin: "-25% 0px -55% 0px",
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("id");
            headerNavLinks.forEach(link => {
                const targetHref = link.getAttribute("href");
                if (targetHref === `#${sectionId}`) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            });
        }
    });
}, observerOptions);

navObservedSections.forEach(section => sectionObserver.observe(section));

// Fallback checking for bottom of page to ensure RSVP gets highlighted
window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 12) {
        headerNavLinks.forEach(link => link.classList.remove("active"));
        const lastNavLink = headerNavLinks[headerNavLinks.length - 1];
        if (lastNavLink) lastNavLink.classList.add("active");
    }
}, { passive: true });

// 3. Mobile Hamburger Overlay Menu with GSAP Slide & Stagger Animations
let mobileMenuTimeline;

if (hasGsap() && primaryNav) {
    mobileMenuTimeline = gsap.timeline({ paused: true });
    mobileMenuTimeline
        .set(primaryNav, { visibility: "visible" })
        .to(primaryNav, {
            yPercent: 100, // animate top overlay from translate Y -100% to 0
            opacity: 1,
            duration: 0.55,
            ease: "power3.inOut"
        })
        .from(headerNavLinks, {
            y: 30,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.25");
}

function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    menuToggle?.classList.toggle("open", isMenuOpen);
    menuToggle?.setAttribute("aria-expanded", isMenuOpen);

    if (isMenuOpen) {
        primaryNav?.classList.add("open");
        document.body.classList.add("modal-open"); // Reuses overflow: hidden scroll lock

        if (hasGsap() && mobileMenuTimeline) {
            mobileMenuTimeline.play();
        } else if (primaryNav) {
            primaryNav.style.visibility = "visible";
            primaryNav.style.transform = "translateY(0)";
            primaryNav.style.opacity = "1";
            primaryNav.style.pointerEvents = "auto";
        }
    } else {
        document.body.classList.remove("modal-open");
        if (hasGsap() && mobileMenuTimeline) {
            mobileMenuTimeline.reverse();
        } else if (primaryNav) {
            primaryNav.style.transform = "translateY(-100%)";
            primaryNav.style.opacity = "0";
            primaryNav.style.pointerEvents = "none";
            setTimeout(() => {
                if (!isMenuOpen) primaryNav.style.visibility = "hidden";
            }, 500);
        }
        setTimeout(() => {
            if (!isMenuOpen) primaryNav?.classList.remove("open");
        }, 550);
    }
}

menuToggle?.addEventListener("click", toggleMobileMenu);

headerNavLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (isMenuOpen) {
            toggleMobileMenu();
        }
    });
});
// =============================================================================
// MODULE 16: CHAPTER HORIZONTAL PHOTO SLIDER — PEEK CAROUSEL + AUTO-PLAY
// =============================================================================

const SLIDER_AUTO_INTERVAL = 3500; // ms between auto-advances

function initChapterSlider(container) {
    const slides = Array.from(container.querySelectorAll('.slider-slide'));
    const prevBtn = container.querySelector('.slider-prev');
    const nextBtn = container.querySelector('.slider-next');
    const dots = Array.from(container.querySelectorAll('.slider-dot'));
    const counterCurrent = container.querySelector('.slider-current');
    const progressFill = container.querySelector('.slider-progress-fill');
    const total = slides.length;

    if (total === 0) return;

    let current = 0;
    let startX = 0;
    let isDragging = false;
    let dragDelta = 0;
    let autoTimer = null;
    let resumeTimeout = null;
    let lastWheelTime = 0;

    function updateStates() {
        slides.forEach((slide, i) => {
            slide.classList.remove('is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next');

            if (i === current) {
                slide.classList.add('is-active');
            } else if (i === (current - 1 + total) % total) {
                slide.classList.add('is-prev');
            } else if (i === (current + 1) % total) {
                slide.classList.add('is-next');
            } else if (i === (current - 2 + total) % total) {
                slide.classList.add('is-far-prev');
            } else if (i === (current + 2) % total) {
                slide.classList.add('is-far-next');
            }
        });

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === current));

        // Update counter
        if (counterCurrent) counterCurrent.textContent = current + 1;
    }

    function goTo(index, fromAuto = false) {
        if (!fromAuto) {
            stopAutoPlay();
            clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(startAutoPlay, 4000);
        }

        if (index < 0) {
            current = total - 1;
        } else if (index >= total) {
            current = 0;
        } else {
            current = index;
        }

        updateStates();

        // Play soft whoosh and haptic on transitions if the card is active/expanded
        const parentCard = container.closest('.story-card');
        if (parentCard && !parentCard.classList.contains('collapsed')) {
            AudioManager.playWhoosh();
            if (!fromAuto) {
                AudioManager.triggerHaptic(20);
            }
        }
    }

    /* Auto-play and progress fill */
    function startAutoPlay() {
        stopAutoPlay();

        if (progressFill) {
            progressFill.style.transition = 'none';
            progressFill.style.width = '0%';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    progressFill.style.transition = `width ${SLIDER_AUTO_INTERVAL}ms linear`;
                    progressFill.style.width = '100%';
                });
            });
        }

        autoTimer = setTimeout(() => {
            goTo(current + 1, true);
            startAutoPlay();
        }, SLIDER_AUTO_INTERVAL);
    }

    function stopAutoPlay() {
        clearTimeout(autoTimer);
        autoTimer = null;
        if (progressFill) {
            progressFill.style.transition = 'none';
            progressFill.style.width = '0%';
        }
    }

    // Pause on interaction
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', () => {
        if (!resumeTimeout) startAutoPlay();
    });

    // Arrow buttons
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // Dot navigation
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // Keyboard support
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Mouse wheel support (horizontal only inside the carousel)
    container.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (now - lastWheelTime < 800) return; // limit scroll frequency

        if (Math.abs(e.deltaX) > 30) {
            e.preventDefault();
            if (e.deltaX > 0) {
                goTo(current + 1);
            } else {
                goTo(current - 1);
            }
            lastWheelTime = now;
        }
    }, { passive: false });

    // Touch Swipe support
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        dragDelta = 0;
        stopAutoPlay();
        clearTimeout(resumeTimeout);
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        dragDelta = e.touches[0].clientX - startX;
    }, { passive: true });

    container.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        const threshold = 50;
        if (dragDelta < -threshold) {
            goTo(current + 1);
        } else if (dragDelta > threshold) {
            goTo(current - 1);
        } else {
            // snapped back
            resumeTimeout = setTimeout(startAutoPlay, 2000);
        }
    });

    // Mouse drag support
    container.addEventListener('mousedown', (e) => {
        if (e.target.closest('.slider-controls, .slider-progress-bar')) return;
        startX = e.clientX;
        isDragging = true;
        dragDelta = 0;
        stopAutoPlay();
        clearTimeout(resumeTimeout);
        container.style.cursor = 'grabbing';
    });

    const onMouseMove = (e) => {
        if (!isDragging) return;
        dragDelta = e.clientX - startX;
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        container.style.cursor = '';
        const threshold = 60;
        if (dragDelta < -threshold) {
            goTo(current + 1);
        } else if (dragDelta > threshold) {
            goTo(current - 1);
        } else {
            resumeTimeout = setTimeout(startAutoPlay, 2000);
        }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Initial state
    updateStates();
    setTimeout(startAutoPlay, 1000);
}

// Initialize all sliders on page load
document.querySelectorAll('[data-slider]').forEach(initChapterSlider);

// =============================================================================
// MODULE 18: PREMIUM SOUND DESIGN & HAPTIC FEEDBACK
// =============================================================================

const AudioManager = {
    ctx: null,
    muted: false,
    bgm: null,
    bgmFadeInterval: null,
    isAutoplayFallbackBound: false,

    init() {
        if (this.bgm) return;

        // Default state must be ON unless user explicitly muted in a previous session
        const savedMute = localStorage.getItem('project_ra_muted');
        if (savedMute !== null) {
            this.muted = savedMute === 'true';
        } else {
            this.muted = false; // ENABLED by default
        }

        // Initialize Web Audio context for synthesized sound effects
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            try {
                this.ctx = new AudioContextClass();
            } catch (e) {
                console.warn('AudioContext creation failed:', e);
            }
        }

        // Create HTML5 audio element for loopable BGM streaming
        this.bgm = new Audio();
        this.bgm.src = 'assets/sound/bgm.mp3';
        this.bgm.loop = true;
        this.bgm.volume = 0; // Start silent for smooth fade-in
        this.bgm.crossOrigin = 'anonymous';

        // Bind event listeners to ensure floating toggle icon reflects exact playback status
        ['play', 'playing', 'pause', 'ended'].forEach(evt => {
            this.bgm.addEventListener(evt, () => this.updateToggleUI());
        });

        this.updateToggleUI();

        if (!this.muted) {
            this.startBgm();
        }
    },

    toggleMute() {
        this.init();
        if (!this.bgm) return;

        this.muted = !this.muted;
        localStorage.setItem('project_ra_muted', this.muted);

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => { });
        }

        if (this.muted) {
            this.stopBgm();
        } else {
            this.startBgm();
        }

        this.updateToggleUI();
        this.playClick();
        this.triggerHaptic(30);
    },

    updateToggleUI() {
        const btn = document.getElementById('floatingAudioToggle');
        if (!btn) return;

        // Reflect current state: ON when playing, OFF when paused or muted
        const isPlaying = Boolean(this.bgm && !this.bgm.paused && !this.muted);

        if (!isPlaying) {
            btn.classList.add('muted');
            btn.classList.remove('playing');
            btn.setAttribute('aria-label', 'Enable sound');
        } else {
            btn.classList.add('playing');
            btn.classList.remove('muted');
            btn.setAttribute('aria-label', 'Mute sound');
        }

        if (!btn.querySelector('.audio-indicator-wrapper')) {
            btn.innerHTML = `
                <div class="audio-indicator-wrapper">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="audio-crescent">
                        <path d="M12 3a6 6 0 0 0 9 9 9 0 1 1-9-9Z" fill="currentColor"/>
                    </svg>
                    <div class="audio-equalizer">
                        <span class="bar bar-1"></span>
                        <span class="bar bar-2"></span>
                        <span class="bar bar-3"></span>
                        <span class="bar bar-4"></span>
                    </div>
                </div>
            `;
        }
    },

    startBgm() {
        if (this.muted || !this.bgm) return;

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => { });
        }

        const playPromise = this.bgm.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.fadeInBgm();
                this.updateToggleUI();
            }).catch(() => {
                // Autoplay blocked by browser policy -> gracefully queue play on first user interaction
                this.setupAutoplayFallback();
            });
        } else {
            this.fadeInBgm();
            this.updateToggleUI();
        }
    },

    fadeInBgm() {
        if (this.muted || !this.bgm) return;
        clearInterval(this.bgmFadeInterval);

        const targetVol = 0.15;
        const step = 0.005;
        const intervalTime = 100;

        this.bgmFadeInterval = setInterval(() => {
            if (this.muted || !this.bgm || this.bgm.paused) {
                clearInterval(this.bgmFadeInterval);
                return;
            }
            if (this.bgm.volume < targetVol) {
                this.bgm.volume = Math.min(targetVol, this.bgm.volume + step);
            } else {
                clearInterval(this.bgmFadeInterval);
            }
        }, intervalTime);
    },

    stopBgm() {
        if (!this.bgm) return;

        clearInterval(this.bgmFadeInterval);

        const step = 0.01;
        const intervalTime = 100;

        this.bgmFadeInterval = setInterval(() => {
            if (!this.bgm) {
                clearInterval(this.bgmFadeInterval);
                return;
            }
            if (this.bgm.volume > 0) {
                this.bgm.volume = Math.max(0, this.bgm.volume - step);
            } else {
                clearInterval(this.bgmFadeInterval);
                this.bgm.pause();
                this.updateToggleUI();
            }
        }, intervalTime);
    },

    setupAutoplayFallback() {
        if (this.isAutoplayFallbackBound) return;
        this.isAutoplayFallbackBound = true;

        const events = ['click', 'touchstart', 'touchend', 'pointerdown', 'scroll', 'keydown', 'wheel'];

        const resumeOnInteract = () => {
            // Remove all interaction listeners immediately to prevent duplicate calls
            events.forEach(evt => {
                window.removeEventListener(evt, resumeOnInteract, { capture: true });
                document.removeEventListener(evt, resumeOnInteract, { capture: true });
            });
            this.isAutoplayFallbackBound = false;

            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => { });
            }

            if (this.bgm && !this.muted && this.bgm.paused) {
                this.bgm.play().then(() => {
                    this.fadeInBgm();
                    this.updateToggleUI();
                }).catch(() => { });
            }
        };

        events.forEach(evt => {
            window.addEventListener(evt, resumeOnInteract, { capture: true, passive: true });
            document.addEventListener(evt, resumeOnInteract, { capture: true, passive: true });
        });
    },

    // Synthetic Sound Effects
    playClick() {
        if (this.muted || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    },

    playPageTurn() {
        if (this.muted || !this.ctx) return;

        // Synthesize paper rustle using noise buffer
        const bufferSize = this.ctx.sampleRate * 0.4; // 0.4 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter to sculpt the white noise into a paper slide sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(3.0, this.ctx.currentTime);
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    },

    playWhoosh() {
        if (this.muted || !this.ctx) return;

        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Lowpass filter swept down for elegant whoosh
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    },

    playShimmer() {
        if (this.muted || !this.ctx) return;

        // Ascent shimmering notes (pentatonic star sparkles)
        const notes = [880, 1100, 1320, 1650, 1980];
        notes.forEach((freq, idx) => {
            const delay = idx * 0.06;
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.4);
            }, delay * 1000);
        });
    },

    playChime() {
        if (this.muted || !this.ctx) return;

        // Ascending major arpeggio chime (C5 -> E5 -> G5 -> C6) for RSVP submit
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const delay = idx * 0.12;
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

                // Add a feedback delay line to simulate spatial resonance/reverb
                const delayNode = this.ctx.createDelay();
                delayNode.delayTime.value = 0.25;
                const delayGain = this.ctx.createGain();
                delayGain.gain.value = 0.3;

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                gain.connect(delayNode);
                delayNode.connect(delayGain);
                delayGain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.9);
            }, delay * 1000);
        });
    },

    playNavigationClick() {
        if (this.muted || !this.ctx) return;

        // Two quick subtle tick-tocks
        const times = [0, 0.07];
        times.forEach((t) => {
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(t === 0 ? 900 : 700, this.ctx.currentTime);
                gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.04);
            }, t * 1000);
        });
    },

    playHover() {
        if (this.muted || !this.ctx) return;
        // Check if device is touch-only to prevent false hover triggers on tap
        if (window.matchMedia('(pointer: coarse)').matches) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.003, this.ctx.currentTime); // quiet and subtle
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.02);
        } catch (e) { }
    },

    // Web Vibration API
    triggerHaptic(duration) {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(duration);
            } catch (e) {
                // fail silently
            }
        }
    }
};

// Bind floating audio button on load
document.getElementById('floatingAudioToggle')?.addEventListener('click', () => {
    AudioManager.toggleMute();
});

// Bind map buttons clicks for directions click sound and haptics
document.querySelectorAll('.map-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        AudioManager.playNavigationClick();
        AudioManager.triggerHaptic(20);
    });
});

// Bind all standard buttons, modals, and close buttons for standard clicks and haptics
document.querySelectorAll('button:not(#floatingAudioToggle), .btn:not(.map-btn), .modal-close-btn, .modal-nav-btn, .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        AudioManager.playClick();
        AudioManager.triggerHaptic(15);
    });
});

// Bind navigation links for sound and haptics
document.querySelectorAll('#primary-nav a').forEach(link => {
    link.addEventListener('click', () => {
        AudioManager.playNavigationClick();
        AudioManager.triggerHaptic(20);
    });
});

// Bind timeline card interaction haptics
document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', () => {
        AudioManager.triggerHaptic(15);
    });
});

// Bind card and interactive element hovers for desktop-only hover sounds
document.querySelectorAll('.event-card, .gallery-item, button, .btn, #primary-nav a, .map-btn, .modal-dot').forEach(el => {
    el.addEventListener('mouseenter', () => {
        AudioManager.playHover();
    });
});

// Initialize user audio immediately on load
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => AudioManager.init());
} else {
    AudioManager.init();
}

