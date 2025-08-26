
        const API_KEYS = {
            version1: ["AIzaSyAR9KxHPdsPXuHhAQZv7c-3jy-uyZxxtvI"], // Single key for Version 1
            version2: ["AIzaSyDBG6dTztTVDTi3hsIURw5IuRy50e66jx4"], // Single key for Version 2
            version3: [ // Multiple keys for Version 3 (auto-cycle)
                "AIzaSyDrEXF0B-elwHgVFoZeBvidM3E7xOAiCIM",
                // Add more keys here if needed for auto-cycling
                // "YOUR_GEMINI_API_KEY_4",
                // "YOUR_GEMINI_API_KEY_5"
            ]
        };
        const MODEL_ID = "gemini-2.0-flash-preview-image-generation";
        const APP_VERSION = "1.2.0"; // New constant for application version

        let currentAPIKey = API_KEYS.version1[0]; // Default to the first key of Version 1
        let currentAPIVersion = "version1";
        let apiKeyIndex = 0; // For cycling through Version 3 keys

        const generateBtn = document.getElementById("generateBtn");
        const downloadBtn = document.getElementById("downloadBtn");
        const styleSelector = document.getElementById("styleSelector");
        const styleDetailsPromptInput = document.getElementById("styleDetailsPrompt");
        const appearancePromptInput = document.getElementById("appearancePrompt");
        const clothingPromptInput = document.getElementById("clothingPrompt");
        const actionBackgroundPromptInput = document.getElementById("actionBackgroundPrompt");
        const negativePromptInput = document.getElementById("negativePrompt");
        const commonNegativeCheckboxes = document.querySelectorAll('.common-negative-prompts input[type="checkbox"]');

        const loadingDiv = document.getElementById("loading");
        const errorMessageDiv = document.getElementById("error-message");
        const imageContainer = document.getElementById("imageContainer");
        const initialPlaceholder = document.getElementById("initialPlaceholder");
        const generatedImageWrapper = document.getElementById("generatedImageWrapper");
        const textResponseDiv = document.getElementById("textResponse");
        const generatedTextSpan = document.getElementById("generatedText");

        const watermarkCanvas = document.getElementById("watermarkCanvas");
        const ctx = watermarkCanvas.getContext("2d");

        const settingsBtn = document.getElementById("settingsBtn");
        const appSettingsModal = document.getElementById("appSettingsModal"); // Renamed
        const closeAppSettingsModalBtn = document.getElementById("closeAppSettingsModalBtn"); // Renamed
        const saveAppSettingsBtn = document.getElementById("saveAppSettingsBtn"); // Renamed
        const appVersionDisplay = document.getElementById("appVersionDisplay"); // New display element
        const currentVersionDisplay = document.getElementById("currentVersionDisplay");
        const currentApiKeyDisplay = document.getElementById("currentApiKeyDisplay");
        const currentModelIdDisplay = document.getElementById("currentModelIdDisplay");

        // New What's New Modal elements
        const openWhatsNewBtn = document.getElementById("openWhatsNewBtn");
        const whatsNewModal = document.getElementById("whatsNewModal");
        const closeWhatsNewModalBtn = document.getElementById("closeWhatsNewModalBtn");

        const copyPromptBtn = document.getElementById("copyPromptBtn");
        const clearInputsBtn = document.getElementById("clearInputsBtn");
        const toggleHistoryBtn = document.getElementById("toggleHistoryBtn");
        const promptHistoryContainer = document.getElementById("promptHistoryContainer");
        const promptHistoryList = document.getElementById("promptHistoryList");
        let promptHistory = []; // Array to store generated prompts (now objects)

        let currentWatermarkedImage = null; // To store the latest watermarked image data URL

        // --- Modal & Tab Data Definitions ---
        const charItemsByCategory = {
            'general': [
                { value: '1 boy', text: '1 boy' },
                { value: '1 girl', text: '1 girl' },
                { value: 'young boy', text: 'Young Boy' },
                { value: 'young girl', text: 'Young Girl' },
                { value: 'teenager boy', text: 'Teen Boy' },
                { value: 'teenager girl', text: 'Teen Girl' },
                { value: 'adult male', text: 'Adult Male' },
                { value: 'adult female', text: 'Adult Female' },
                { value: 'elderly man', text: 'Elderly Man' },
                { value: 'elderly woman', text: 'Elderly Woman' },
                { value: 'child', text: 'Child' },
                { value: 'baby', text: 'Baby' },
                { value: 'fantasy elf', text: 'Fantasy Elf' },
                { value: 'fantasy dwarf', text: 'Fantasy Dwarf' },
                { value: 'fantasy orc', text: 'Fantasy Orc' },
                { value: 'mythical creature', text: 'Mythical Creature' },
                { value: 'robot', text: 'Robot' },
                { value: 'animal character', text: 'Animal Character' },
                { value: 'monster', text: 'Monster' },
                { value: 'angel', text: 'Angel' },
                { value: 'demon', text: 'Demon' },
                { value: 'vampire', text: 'Vampire' },
                { value: 'werewolf', text: 'Werewolf' },
            ],
            'male': [
                { value: 'young boy', text: 'Young Boy' },
                { value: 'teenager boy', text: 'Teen Boy' },
                { value: 'adult male', text: 'Adult Male' },
                { value: 'elderly man', text: 'Elderly Man' },
                { value: 'muscular man', text: 'Muscular Man' },
                { value: 'slender man', text: 'Slender Man' },
                { value: 'bearded man', text: 'Bearded Man' },
                { value: 'man with glasses', text: 'Man with Glasses' },
                { value: 'businessman', text: 'Businessman' },
                { value: 'hero male', text: 'Hero' },
                { value: 'villain male', text: 'Villain' },
            ],
            'female': [
                { value: 'young girl', text: 'Young Girl' },
                { value: 'teenager girl', text: 'Teen Girl' },
                { value: 'adult female', text: 'Adult Female' },
                { value: 'curvy woman', text: 'Curvy Woman' },
                { value: 'petite woman', text: 'Petite Woman' },
                { value: 'woman with long hair', text: 'Long Hair Woman' },
                { value: 'woman with short hair', text: 'Short Hair Woman' },
                { value: 'businesswoman', text: 'Businesswoman' },
                { value: 'hero female', text: 'Heroine' },
                { value: 'villain female', text: 'Villainess' },
            ],
            'pairs': [
                { value: '2 boys', text: '2 boys' },
                { value: '2 girls', text: '2 girls' },
                { value: '1 boy and 1 girl', text: '1 boy and 1 girl' },
                { value: 'couple', text: 'Couple' },
                { value: 'siblings', text: 'Siblings' },
                { value: 'friends duo', text: 'Friends Duo' },
            ],
            'groups': [
                { value: '2 people', text: '2 people' },
                { value: '3 people', text: '3 people' },
                { value: 'group of friends', text: 'Group of Friends' },
                { value: 'family', text: 'Family' },
                { value: 'crowd', text: 'Crowd' },
                { value: 'team', text: 'Team' },
            ],
            'fantasy': [
                { value: 'fantasy elf', text: 'Fantasy Elf' },
                { value: 'fantasy dwarf', text: 'Fantasy Dwarf' },
                { value: 'fantasy orc', text: 'Fantasy Orc' },
                { value: 'mythical creature', text: 'Mythical Creature' },
                { value: 'dragon', text: 'Dragon' },
                { value: 'wizard', text: 'Wizard' },
                { value: 'knight', text: 'Knight' },
                { value: 'fairy', text: 'Fairy' },
                { value: 'goblin', text: 'Goblin' },
                { value: 'mermaid', text: 'Mermaid' },
                { value: 'centaur', text: 'Centaur' },
                { value: 'angel', text: 'Angel' },
                { value: 'demon', text: 'Demon' },
                { value: 'vampire', text: 'Vampire' },
                { value: 'werewolf', text: 'Werewolf' },
            ],
            'chibi': [
                { value: 'chibi character, cute, big head, small body, super deformed', text: 'Chibi Character' },
                { value: 'chibi boy', text: 'Chibi Boy' },
                { value: 'chibi girl', text: 'Chibi Girl' },
                { value: 'chibi animal', text: 'Chibi Animal' },
            ],
            'genshin-impact': [
                { value: 'Genshin Impact character Paimon, floating, small, cute', text: 'Paimon' },
                { value: 'Genshin Impact character Lumine, blonde hair, traveler outfit, sword', text: 'Lumine' },
                { value: 'Genshin Impact character Aether, blonde hair, traveler outfit, sword', text: 'Aether' },
                { value: 'Genshin Impact character Raiden Shogun, Electro Archon, elegant kimono, purple lightning', text: 'Raiden Shogun' },
                { value: 'Genshin Impact character Zhongli, Geo Archon, formal attire, staff, amber eyes', text: 'Zhongli' },
                { value: 'Genshin Impact character Venti, Anemo Archon, bard outfit, lyre, playful', text: 'Venti' },
                { value: 'Genshin Impact character Nahida, Dendro Archon, childlike, white hair, green eyes', text: 'Nahida' },
                { value: 'Genshin Impact character Yae Miko, shrine maiden, pink hair, fox ears, intelligent', text: 'Yae Miko' },
                { value: 'Genshin Impact character Klee, Spark Knight, small, bombs, red outfit', text: 'Klee' },
                { value: 'Genshin Impact character Ganyu, Qilin, long blue hair, Cryo Vision, elegant dress', text: 'Ganyu' },
                { value: 'Genshin Impact character Hu Tao, Funeral Parlor Director, playful, dark outfit, ghost companion', text: 'Hu Tao' },
                { value: 'Genshin Impact character Eula, Spindrift Knight, blue hair, Cryo Claymore user, elegant dress', text: 'Eula' },
                { value: 'Genshin Impact character Keqing, Yuheng of Liyue Qixing, purple hair, cat ears, sword', text: 'Keqing' },
                { value: 'Genshin Impact character Jean, Dandelion Knight, blonde hair, elegant uniform, Anemo sword', text: 'Jean' },
                { value: 'Genshin Impact character Diluc, Dawn Winery owner, red hair, long coat, Pyro Claymore', text: 'Diluc' },
                { value: 'Genshin Impact character Albedo, Chief Alchemist, blonde hair, Geo sword, intellectual', text: 'Albedo' },
                { value: 'Genshin Impact character Kazuha, wandering samurai, red maple leaf motif, Anemo sword', text: 'Kazuha' },
                { value: 'Genshin Impact character Wanderer, Anemo Catalyst, dark outfit, calm expression', text: 'Wanderer' },
                { value: 'Genshin Impact character Furina, Hydro Archon, dramatic, white hair, blue eyes', text: 'Furina' },
                { value: 'Genshin Impact character Navia, Spina di Rosula President, elegant yellow dress, large hat', text: 'Navia' },
                { value: 'Genshin Impact character Chevreuse', text: 'Chevreuse' },
                { value: 'Genshin Impact character Gaming', text: 'Gaming' },
                { value: 'Genshin Impact character Xianyun', text: 'Xianyun' },
                { value: 'Genshin Impact character Chiori', text: 'Chiori' },
                { value: 'Genshin Impact character Arlecchino', text: 'Arlecchino' },
            ],
            'jujutsu-kaisen': [],
            'spy-x-family': [],
            'kimetsu-no-yaiba': [],
            'chainsaw': [],
            'original-characters': [],
        };

        const actionItems = [
            { value: 'Standing pose, full body shot, confident posture', text: 'Standing' },
            { value: 'Sitting pose, thoughtful expression, relaxed posture', text: 'Sitting' },
            { value: 'Running pose, dynamic motion, blurred background, full speed, action shot', text: 'Running' },
            { value: 'Jumping pose, mid-air, energetic, arms outstretched, dynamic pose', text: 'Jumping' },
            { value: 'Flying pose, graceful, soaring through clouds, majestic wings, ethereal motion', text: 'Flying' },
            { value: 'Fighting pose, aggressive, action shot, weapon in hand, ready for combat, dynamic battle scene', text: 'Fighting' },
            { value: 'Holding a sword, ready for battle, strong grip, gleaming blade, warrior stance', text: 'Holding Sword' },
            { value: 'Reading a book, relaxed, engrossed, soft lighting, cozy atmosphere, intellectual', text: 'Reading Book' },
            { value: 'Smiling expression, happy, joyful, open mouth, cheerful eyes, heartwarming', text: 'Smiling' },
            { value: 'Crying expression, sad, tears streaming, emotional, mournful, heartbroken', text: 'Crying' },
            { value: 'Laughing expression, mouth open, joyful, head tilted back, genuine laughter, carefree', text: 'Laughing' },
            { value: 'Meditating pose, calm, serene, eyes closed, peaceful aura, spiritual', text: 'Meditating' },
            { value: 'Walking casually, relaxed stroll, outdoor setting, hands in pockets, urban walk', text: 'Walking' },
            { value: 'Dancing, fluid movement, expressive body language, energetic, swirling fabric, elegant dance', text: 'Dancing' },
            { value: 'Sleeping peacefully, tranquil, on a bed, soft blanket, gentle breathing, serene dream', text: 'Sleeping' },
            { value: 'Waving hand, friendly greeting, open palm, inviting gesture, welcoming', text: 'Waving' },
            { value: 'Eating food, enjoying a meal, delicious, happy expression', text: 'Eating' },
            { value: 'Drinking beverage, holding a cup, relaxed, refreshing', text: 'Drinking' },
            { value: 'Playing musical instrument, guitar, piano, violin, focused, passionate', text: 'Playing Music' },
            { value: 'Working at a desk, focused, typing, computer screen, busy', text: 'Working' },
            { value: 'Training, exercising, pushing limits, determined, sweaty', text: 'Training' },
            { value: 'Casting a spell, magical energy, glowing hands, arcane symbols', text: 'Casting Spell' },
            { value: 'Driving a car, focused on road, modern vehicle, city night', text: 'Driving' },
            { value: 'Riding a horse, galloping, majestic, flowing mane', text: 'Riding Horse' },
        ];

        const outfitItems = [
            { value: 'Casual clothes, t-shirt, jeans, sneakers, comfortable, everyday wear, stylish casual', text: 'Casual Wear' },
            { value: 'Formal attire, suit, tie, elegant dress, high heels, sophisticated, business casual, black tie event', text: 'Formal Attire' },
            { value: 'Knight armor, full plate armor, sword and shield, medieval, shining metal, battle-worn, intricate engravings', text: 'Knight Armor' },
            { value: 'Futuristic suit, cyberpunk outfit, glowing accents, metallic parts, sleek design, high-tech fabric, LED lights', text: 'Futuristic Suit' },
            { value: 'Traditional Japanese clothing, kimono, yukata, obi sash, intricate patterns, elegant silk, cherry blossoms motif', text: 'Japanese Trad.' },
            { value: 'Gothic dress, Victorian style, dark lace, corsets, elegant yet dark, velvet, ruffles, dramatic, mysterious', text: 'Gothic Dress' },
            { value: 'Sportswear, athletic wear, running shoes, track suit, comfortable, performance fabric, activewear', text: 'Sportswear' },
            { value: 'Steampunk outfit, gears, goggles, leather, intricate machinery, Victorian sci-fi, brass accents, inventor style', text: 'Steampunk' },
            { value: 'School uniform, blazer, skirt/pants, tie, polished shoes, academic, neat, classic school look', text: 'Uniform' },
            { value: 'Fantasy adventurer gear, leather armor, utility belt, cape, rugged, well-worn, practical, elven dagger', text: 'Adventurer Gear' },
            { value: 'Royal attire, crown, flowing robes, expensive jewelry, opulent, majestic, embroidered, gold accents', text: 'Royal Attire' },
            { value: 'Wizard robes, staff, pointed hat, magical accessories, ancient scrolls, enchanted, starry patterns', text: 'Wizard Robes' },
            { value: 'Swimsuit, beachwear, bikini, swimming trunks, summer, relaxed', text: 'Swimsuit' },
            { value: 'Winter coat, scarf, gloves, warm clothing, snow boots, cozy', text: 'Winter Attire' },
            { value: 'Traditional Chinese dress, qipao, cheongsam, silk, embroidered, elegant', text: 'Chinese Trad.' },
            { value: 'Military uniform, camouflage, tactical gear, disciplined, combat ready', text: 'Military Uniform' },
            { value: 'Doctor\'s coat, scrubs, stethoscope, professional, medical', text: 'Doctor/Nurse' },
            { value: 'Chef uniform, apron, chef hat, cooking utensils, culinary', text: 'Chef Uniform' },
        ];

        const sceneItems = [
            { value: 'Forest background, lush trees, dappled sunlight, dense foliage, serene, magical atmosphere, ancient trees, shimmering light', text: 'Forest' },
            { value: 'City street background, bustling, skyscrapers, neon signs, urban environment, vibrant nightlife, busy traffic, futuristic cityscape', text: 'City Street' },
            { value: 'Beach background, sunny, clear water, sandy shores, palm trees, tropical, tranquil, gentle waves, golden hour', text: 'Beach' },
            { value: 'Mountain landscape, snow-capped peaks, rugged terrain, vast sky, breathtaking view, majestic, alpine, clear air', text: 'Mountain' },
            { value: 'Space background, starry night, nebulae, planets, cosmic dust, aurora borealis, sci-fi vista, deep space, distant galaxies', text: 'Space' },
            { value: 'Castle interior, grand hall, stone walls, tapestries, candlelight, royal decor, medieval, antique furniture, noble', text: 'Castle Interior' },
            { value: 'Cozy cafe interior, warm lighting, wooden tables, coffee steam, books, comfortable, inviting, bustling, soft music', text: 'Cozy Cafe' },
            { value: 'Fantasy kingdom, majestic castle, rolling hills, vibrant flora, clear skies, utopian, magical land, ancient towers', text: 'Fantasy Kingdom' },
            { value: 'Sci-fi laboratory, glowing tubes, complex machinery, sterile environment, futuristic tech, advanced research, clean room', text: 'Sci-fi Lab' },
            { value: 'Underwater scene, coral reef, exotic fish, shimmering light, blue hues, vibrant marine life, sunken ruins, mysterious depths', text: 'Underwater' },
            { value: 'Desert landscape, sand dunes, scorching sun, vast open space, desolate, ancient ruins, mirage, cracked earth', text: 'Desert' },
            { value: 'Snowy landscape, winter forest, falling snow, icy ground, cold atmosphere, frozen lake, tranquil winter, blizzard', text: 'Snowy Scene' },
            { value: 'Rainy street, wet asphalt, reflections, neon lights, dramatic atmosphere, umbrella', text: 'Rainy Street' },
            { value: 'Volcanic landscape, lava flows, smoke, ash, dangerous, fiery sky', text: 'Volcanic' },
            { value: 'Ancient temple, overgrown ruins, jungle, mystical, forgotten, stone carvings', text: 'Ancient Temple' },
            { value: 'Cyberpunk alley, dark, neon graffiti, steaming vents, shadowy figures', text: 'Cyberpunk Alley' },
        ];

        // --- End Modal & Tab Data Definitions ---

        // Function to update the displayed settings in the modal
        function updateCurrentSettingsDisplay() {
            appVersionDisplay.textContent = APP_VERSION;
            currentVersionDisplay.textContent = currentAPIVersion.replace("version", "Version ");
            currentApiKeyDisplay.textContent = currentAPIKey ? currentAPIKey.substring(0, 5) + "..." + currentAPIKey.substring(currentAPIKey.length - 5) : "Not set";
            currentModelIdDisplay.textContent = "Queendom AI 0.2";
            const selectedRadio = document.querySelector(`input[name="api_version"][value="${currentAPIVersion}"]`);
            if (selectedRadio) {
                selectedRadio.checked = true;
            }
        }

        // Function to add watermark
        function addWatermark(imageDataUrl, watermarkText) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    watermarkCanvas.width = img.width;
                    watermarkCanvas.height = img.height;

                    ctx.drawImage(img, 0, 0);

                    // Watermark settings
                    ctx.font = `${Math.floor(img.width * 0.04)}px Arial`;
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.textAlign = "right";
                    ctx.textBaseline = "bottom";

                    const margin = Math.floor(img.width * 0.02);
                    ctx.fillText(watermarkText, img.width - margin, img.height - margin);

                    resolve(watermarkCanvas.toDataURL("image/png"));
                };
                img.src = imageDataUrl;
            });
        }

        // --- Prompt Reference Tabs and Sidebar Logic ---
        document.addEventListener('DOMContentLoaded', () => {
            const tabItems = document.querySelectorAll('.prompt-tabs .tab-item');
            const tabContents = document.querySelectorAll('.tab-content-area .tab-content');
            const sidebarItems = document.querySelectorAll('.sidebar .sidebar-item');
            const characterSelectorsGrid = document.querySelector('.character-selectors');
            const styleSelectorsGrid = document.querySelector('.style-selectors');

            // Function to update character selectors
            function updateCharacterSelectors(category) {
                let contentHTML = '';
                const currentItems = charItemsByCategory[category] || [];

                if (currentItems.length > 0) {
                    currentHTML = currentItems.map(itemData => `
                        <div class="selector-item" data-value="${itemData.value}">
                            <span>${itemData.text}</span>
                        </div>
                    `).join('');
                } else {
                    currentHTML = '<p style="text-align: center; color: var(--text-color); padding: 20px;">Options for this category are coming soon!</p>';
                }
                characterSelectorsGrid.innerHTML = currentHTML;
                attachSelectorItemListeners(characterSelectorsGrid, 'appearancePrompt');
            }

            // Generic function to attach listeners to selectors grid
            function attachSelectorItemListeners(container, targetPromptId) {
                container.querySelectorAll('.selector-item').forEach(item => {
                    item.removeEventListener('click', handleSelectorClick); // Prevent duplicate listeners
                    item.addEventListener('click', () => handleSelectorClick.call(item, targetPromptId));
                });
            }

            function handleSelectorClick(targetPromptId) {
                const selectedValue = this.dataset.value;
                const targetPromptInput = document.getElementById(targetPromptId);

                if (targetPromptInput) {
                    let currentValue = targetPromptInput.value.trim();
                    const values = currentValue.split(', ').map(v => v.trim()).filter(v => v !== '');
                    if (!values.includes(selectedValue)) {
                        values.push(selectedValue);
                        targetPromptInput.value = values.join(', ');
                    }
                } else {
                    console.error(`Target prompt input with ID '${targetPromptId}' not found.`);
                }
            }

            // Modal specific functions - REVISED to use active class
            function openTabModal(modalId, dataItems, targetPromptId, title) {
                const modal = document.getElementById(modalId);
                const grid = modal.querySelector('.selectors-grid');
                modal.querySelector('h3').textContent = title;

                let contentHTML = '';
                if (dataItems.length > 0) {
                    contentHTML = dataItems.map(itemData => `
                        <div class="selector-item" data-value="${itemData.value}">
                            <span>${itemData.text}</span>
                        </div>
                    `).join('');
                } else {
                    contentHTML = '<p style="text-align: center; color: var(--text-color); padding: 20px;">No options available.</p>';
                }
                grid.innerHTML = contentHTML;
                attachSelectorItemListeners(grid, targetPromptId);
                
                modal.classList.add('active'); // Add 'active' class to show modal
            }

            function closeTabModal(modalId) {
                document.getElementById(modalId).classList.remove('active'); // Remove 'active' class to hide modal
            }

            // Event listeners for main tabs
            tabItems.forEach(item => {
                item.addEventListener('click', () => {
                    tabItems.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(tc => tc.classList.remove('active'));
                    item.classList.add('active');
                    document.getElementById(`${item.dataset.tab}-tab-content`).classList.add('active');

                    // Handle specific tabs opening modals
                    if (item.dataset.tab === 'character') {
                        sidebarItems.forEach(si => si.classList.remove('active'));
                        document.querySelector('.sidebar-item[data-category="general"]').classList.add('active');
                        updateCharacterSelectors('general');
                    } else if (item.dataset.tab === 'style') {
                        attachSelectorItemListeners(styleSelectorsGrid, 'styleDetailsPrompt');
                    } else if (item.dataset.tab === 'action') {
                        openTabModal('actionModal', actionItems, 'actionBackgroundPrompt', 'Select Action');
                    } else if (item.dataset.tab === 'outfit') {
                        openTabModal('outfitModal', outfitItems, 'clothingPrompt', 'Select Outfit & Accessories');
                    } else if (item.dataset.tab === 'scene') {
                        openTabModal('sceneModal', sceneItems, 'actionBackgroundPrompt', 'Select Scene & Background');
                    }
                });
            });

            // Event listeners for sidebar items (character tab only)
            sidebarItems.forEach(item => {
                item.addEventListener('click', () => {
                    sidebarItems.forEach(si => si.classList.remove('active'));
                    item.classList.add('active');
                    updateCharacterSelectors(item.dataset.category);
                });
            });

            // Event listeners for closing tab modals
            document.querySelectorAll('.tab-modal-content .close-button').forEach(button => {
                button.addEventListener('click', function() {
                    closeTabModal(this.dataset.modalId);
                });
            });
            document.querySelectorAll('.tab-modal-overlay').forEach(overlay => {
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        closeTabModal(this.id);
                    }
                });
            });

            // Initial load for character tab
            updateCharacterSelectors('general');
            attachSelectorItemListeners(styleSelectorsGrid, 'styleDetailsPrompt');
            updateCurrentSettingsDisplay();
        });
        // --- END Prompt Reference Tabs and Sidebar Logic ---

        // --- Feature Buttons Logic ---
        copyPromptBtn.addEventListener("click", () => {
            const promptData = getCurrentPromptData();
            const promptToCopy = generateCombinedPromptString(promptData);
            if (promptToCopy) {
                navigator.clipboard.writeText(promptToCopy).then(() => {
                    alert("Prompt copied to clipboard!");
                }).catch(err => {
                    console.error('Failed to copy prompt: ', err);
                    alert("Failed to copy prompt.");
                });
            } else {
                alert("No prompt data to copy.");
            }
        });

        clearInputsBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to clear all input fields?")) {
                styleSelector.value = "";
                styleDetailsPromptInput.value = "";
                appearancePromptInput.value = "";
                clothingPromptInput.value = "";
                actionBackgroundPromptInput.value = "";
                negativePromptInput.value = "";
                commonNegativeCheckboxes.forEach(checkbox => {
                    if (checkbox.id !== 'neg_nsfw') {
                        checkbox.checked = false;
                    }
                });
                document.getElementById('neg_nsfw').checked = true;
                alert("All input fields cleared!");
            }
        });

        toggleHistoryBtn.addEventListener("click", () => {
            if (promptHistoryContainer.classList.contains('active')) {
                promptHistoryContainer.classList.remove('active');
                promptHistoryContainer.style.display = 'none'; // Ensure it's truly hidden
                toggleHistoryBtn.textContent = "Toggle History";
            } else {
                promptHistoryContainer.style.display = 'block'; // Make it block before adding active
                promptHistoryContainer.classList.add('active');
                toggleHistoryBtn.textContent = "Toggle History";
                renderPromptHistory();
            }
        });

        // --- Modified Prompt History Management ---
        function addPromptToHistory(promptData) {
            promptHistory.unshift(promptData);
            if (promptHistory.length > 10) {
                promptHistory.pop();
            }
            renderPromptHistory();
        }

        function renderPromptHistory() {
            promptHistoryList.innerHTML = '';
            promptHistory.forEach((pData, index) => {
                const li = document.createElement("li");
                let summaryParts = [];
                if (pData.actionBackground) summaryParts.push(pData.actionBackground);
                if (pData.appearance) summaryParts.push(pData.appearance);
                if (pData.selectedStyle) summaryParts.push(pData.selectedStyle.split(',')[0].trim());

                let summary = summaryParts.join(' / ');
                if (!summary) summary = "Empty Prompt";

                if (summary.length > 100) summary = summary.substring(0, 100) + '...';

                li.textContent = summary;
                li.title = generateCombinedPromptString(pData);
                li.dataset.index = index;
                li.addEventListener('click', () => {
                    if (confirm("Load this prompt into the inputs? This will overwrite current inputs.")) {
                        loadPromptFromHistory(index);
                    }
                });
                promptHistoryList.appendChild(li);
            });
        }

        function loadPromptFromHistory(index) {
            const pData = promptHistory[index];
            if (pData) {
                styleSelector.value = pData.selectedStyle || "";
                styleDetailsPromptInput.value = pData.styleDetails || "";
                appearancePromptInput.value = pData.appearance || "";
                clothingPromptInput.value = pData.clothing || "";
                actionBackgroundPromptInput.value = pData.actionBackground || "";
                negativePromptInput.value = pData.customNegativePrompt || "";

                commonNegativeCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                if (pData.commonNegativeSelections) {
                    pData.commonNegativeSelections.forEach(savedValue => {
                        document.querySelectorAll(`.common-negative-prompts input[type="checkbox"]`).forEach(checkbox => {
                            if (checkbox.value === savedValue) {
                                checkbox.checked = true;
                            }
                        });
                    });
                }
                document.getElementById('neg_nsfw').checked = true;
                alert("Prompt loaded from history!");
            }
        }
        // --- End Modified Prompt History Management ---

        // Function to extract all current input values into an object (for history or API)
        function getCurrentPromptData() {
            const commonNegatives = Array.from(commonNegativeCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            return {
                selectedStyle: styleSelector.value,
                styleDetails: styleDetailsPromptInput.value.trim(),
                appearance: appearancePromptInput.value.trim(),
                clothing: clothingPromptInput.value.trim(),
                actionBackground: actionBackgroundPromptInput.value.trim(),
                customNegativePrompt: negativePromptInput.value.trim(),
                commonNegativeSelections: commonNegatives
            };
        }

        // Helper function to convert a promptData object into the full prompt string
        function generateCombinedPromptString(promptData) {
            let combinedPositivePrompt = "masterpiece, best quality, ultra-detailed, intricate details, photorealistic details, illustrious illustration, cinematic lighting, soft natural light, full body, award-winning, stunning visual effects, professional artwork, 8k, UHD, hyperrealism, sharp focus, vibrant colors, incredible detail, volumetric light, ray tracing, finely rendered, complex background, dynamic composition, perfect anatomy, ";

            if (promptData.selectedStyle) {
                combinedPositivePrompt += `${promptData.selectedStyle}. `;
            } else {
                combinedPositivePrompt += "anime style, highly detailed anime art, vibrant color palette, expressive large eyes, dynamic posing, intricate digital illustration, crisp lines, perfect anatomy, beautiful composition, trending on artstation, pixiv, masterpiece, best quality, cinematic, studio lighting, professional artwork, 4k, 8k, UHD, extreme detail, intricate textures, cel-shaded, light particles, smooth animation influence, high contrast, atmospheric lighting. ";
            }

            if (promptData.styleDetails) combinedPositivePrompt += `${promptData.styleDetails}. `;
            if (promptData.appearance) combinedPositivePrompt += `Appearance: ${promptData.appearance}. `;
            if (promptData.clothing) combinedPositivePrompt += `Clothing & Accessories: ${promptData.clothing}. `;
            if (promptData.actionBackground) combinedPositivePrompt += `Action & Background: ${promptData.actionBackground}. `;

            let finalNegativePromptSet = new Set([
                "lowres", "bad anatomy", "bad hands", "text", "error", "missing fingers", "extra digit", "fewer digits",
                "cropped", "worst quality", "low quality", "normal quality", "jpeg artifacts", "signature", "watermark",
                "username", "blurry", "mutated hands", "deformed face", "disfigured", "extra limbs", "fused fingers",
                "too many fingers", "too few fingers", "malformed limbs", "poorly drawn hands", "poorly drawn face",
                "ugly", "gross proportions", "extra arms", "extra legs", "extra heads", "bad eyes", "crossed eyes",
                "asymmetrical eyes", "floating limbs", "disconnected limbs", "mismatched eyes", "body out of frame",
                "tiling", "cloned face", "duplicate", "render error", "lighting error", "color error", "sketch",
                "drawing", "painting", "cartoon", "3d render", "cgi", "unrealistic", "pixelated", "monochrome",
                "grayscale", "boring colors", "dull colors", "desaturated", "irrelevant objects",
                "poorly drawn feet", "extra feet", "deformed feet", "bad feet", "stretched proportions", "oversaturated",
                "underexposed", "overexposed", "flat lighting", "simple background", "plain background", "empty background",
                "bad perspective", "bad composition", "grainy", "noise", "distorted", "squint", "open mouth (if not desired)",
                "bad hair", "messy hair", "bad clothing", "floating objects", "poor shadow", "broken weapon", "broken accessories",
                "easynegative", "ng_deepnegative_v1_75t",
                "nsfw", "explicit", "sexual", "nude", "gore", "violent", "suggestive", "mature content", "provocative", "disgusting", "repulsive", "amateur", "beginner", "poorly rendered", "dark circles under eyes", "dark skin (if not intended)"
            ]);

            if (promptData.commonNegativeSelections) {
                promptData.commonNegativeSelections.forEach(value => finalNegativePromptSet.add(value));
            }
            if (promptData.customNegativePrompt) {
                promptData.customNegativePrompt.split(',').map(v => v.trim()).forEach(item => finalNegativePromptSet.add(item));
            }

            const finalNegativePrompt = Array.from(finalNegativePromptSet).join(', ');
            return combinedPositivePrompt.trim() + " Exclude: " + finalNegativePrompt.trim();
        }


        generateBtn.addEventListener("click", async () => {
            const promptData = getCurrentPromptData();
            const fullPromptString = generateCombinedPromptString(promptData);
            addPromptToHistory(promptData);

            if (!fullPromptString.trim()) {
                alert("Please enter at least one detail in the prompt fields or select a style!");
                return;
            }

            loadingDiv.style.display = "block";
            errorMessageDiv.style.display = "none";
            initialPlaceholder.style.display = "none";
            generatedImageWrapper.innerHTML = '';
            generatedImageWrapper.style.display = "none";
            textResponseDiv.style.display = "none";
            generatedTextSpan.textContent = "";
            downloadBtn.style.display = "none";
            currentWatermarkedImage = null;

            try {
                let api_to_use = currentAPIKey;
                if (currentAPIVersion === "version3") {
                    if (API_KEYS.version3.length === 0) {
                        errorMessageDiv.textContent = "No API Key configured for Version 3. Please check the script.";
                        errorMessageDiv.style.display = "block";
                        initialPlaceholder.style.display = "block";
                        return;
                    }
                    api_to_use = API_KEYS.version3[apiKeyIndex];
                    apiKeyIndex = (apiKeyIndex + 1) % API_KEYS.version3.length;
                    currentAPIKey = api_to_use;
                    updateCurrentSettingsDisplay();
                }

                if (!api_to_use || api_to_use.startsWith("YOUR_GEMINI_API_KEY")) {
                    errorMessageDiv.textContent = "API Key not configured. Please replace 'YOUR_GEMINI_API_KEY_X' with your actual API key(s) in the script or choose a valid version in settings.";
                    errorMessageDiv.style.display = "block";
                    initialPlaceholder.style.display = "block";
                    return;
                }

               const requestBody = {
                    contents: [
                        {
                            parts: [
                                { text: fullPromptString.trim() }
                            ]
                        }
                    ],
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"] 
                    }
                };

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${api_to_use}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestBody),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("API Error Response:", errorData);
                    if (errorData.error && errorData.error.details && errorData.error.details[0] && errorData.error.details[0].message && errorData.error.details[0].message.includes("Safety setting was triggered")) {
                        errorMessageDiv.textContent = `Your prompt was flagged by the AI's safety filter. Please modify your prompt to be less sensitive.`;
                    } else {
                        errorMessageDiv.textContent = `Error generating image: ${errorData.error.message || response.statusText}`;
                    }
                    errorMessageDiv.style.display = "block";
                    initialPlaceholder.style.display = "block";
                    return;
                }

                const data = await response.json();
                console.log("Full API Response:", data);

                let foundImage = false;
                let foundText = false;

                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                    for (const part of data.candidates[0].content.parts) {
                        if (part.inlineData) {
                            const imageData = part.inlineData.data;
                            const imageMimeType = part.inlineData.mimeType;

                            const originalImageDataUrl = `data:${imageMimeType};base64,${imageData}`;

                            const watermarkedImageDataUrl = await addWatermark(originalImageDataUrl, "Queendom AI");
                            currentWatermarkedImage = watermarkedImageDataUrl;

                            const img = document.createElement("img");
                            img.src = watermarkedImageDataUrl;
                            img.alt = fullPromptString;
                            generatedImageWrapper.appendChild(img);
                            generatedImageWrapper.style.display = "block";
                            foundImage = true;
                            downloadBtn.style.display = "block";
                        } else if (part.text) {
                            generatedTextSpan.textContent = part.text;
                            textResponseDiv.style.display = "block";
                            generatedTextSpan.style.textAlign = "left"; // Set text align to left
                            foundText = true;
                        }
                    }

                    if (!foundImage && !foundText) {
                        errorMessageDiv.textContent = "Error: No image or text found in API response. No content might have been generated. This could be due to safety filters or a very ambiguous prompt.";
                        errorMessageDiv.style.display = "block";
                        initialPlaceholder.style.display = "block";
                    } else if (!foundImage) {
                         errorMessageDiv.textContent = "Warning: No image was generated, only text was received. This might be due to a safety filter or the AI not interpreting the prompt as visual.";
                         errorMessageDiv.style.display = "block";
                         initialPlaceholder.style.display = "block";
                    } else if (!foundText) {
                        errorMessageDiv.textContent = "Warning: No text was generated, only image was received.";
                         errorMessageDiv.style.display = "block";
                    }

                } else if (data.promptFeedback && data.promptFeedback.safetyRatings && data.promptFeedback.safetyRatings.some(rating => rating.blocked)) {
                    errorMessageDiv.textContent = `Your prompt was blocked by the AI's safety filter for one or more categories. Please modify your prompt.`;
                    errorMessageDiv.style.display = "block";
                    initialPlaceholder.style.display = "block";
                } else {
                    errorMessageDiv.textContent = "Error: Unexpected API response. Please try again or check the console for details.";
                    errorMessageDiv.style.display = "block";
                    console.warn("Unexpected API response structure:", data);
                    initialPlaceholder.style.display = "block";
                }

            } catch (error) {
                console.error("Network or Fetch Error:", error);
                errorMessageDiv.textContent = `An error occurred while calling the API: ${error.message}. Please check the console for details. This could be a network issue or an invalid API key.`;
                errorMessageDiv.style.display = "block";
                initialPlaceholder.style.display = "block";
            } finally {
                loadingDiv.style.display = "none";
            }
        });

        // Event listener for the download button
        downloadBtn.addEventListener("click", () => {
            if (currentWatermarkedImage) {
                const a = document.createElement("a");
                a.href = currentWatermarkedImage;
                a.download = "generated_image_queendom_ai.png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert("No image to download. Please generate an image first.");
            }
        });

        // --- App Settings Modal Logic (Formerly Model Selection) ---
        settingsBtn.addEventListener("click", () => {
            appSettingsModal.classList.add("active"); // Add active class
            updateCurrentSettingsDisplay();
        });

        closeAppSettingsModalBtn.addEventListener("click", () => {
            appSettingsModal.classList.remove("active"); // Remove active class
        });

        saveAppSettingsBtn.addEventListener("click", () => {
            const selectedVersion = document.querySelector('input[name="api_version"]:checked').value;
            currentAPIVersion = selectedVersion;

            if (selectedVersion === "version1") {
                currentAPIKey = API_KEYS.version1[0];
            } else if (selectedVersion === "version2") {
                currentAPIKey = API_KEYS.version2[0];
            } else if (selectedVersion === "version3") {
                if (API_KEYS.version3.length > 0) {
                    currentAPIKey = API_KEYS.version3[0];
                    apiKeyIndex = 0;
                } else {
                    alert("No API Key configured for Version 3. Please check the script.");
                    currentAPIKey = "";
                }
            }

            updateCurrentSettingsDisplay();
            appSettingsModal.classList.remove("active"); // Remove active class after saving
            alert(`Settings Saved! Current version: ${currentAPIVersion.replace("version", "Version ")}`);
        });

        // Close appSettingsModal if clicking outside
        appSettingsModal.addEventListener("click", (e) => {
            if (e.target === appSettingsModal) {
                appSettingsModal.classList.remove("active");
            }
        });

        // --- What's New Modal Logic ---
        openWhatsNewBtn.addEventListener("click", () => {
            appSettingsModal.classList.remove("active"); // Close settings modal
            whatsNewModal.classList.add("active"); // Open What's New modal
        });

        closeWhatsNewModalBtn.addEventListener("click", () => {
            whatsNewModal.classList.remove("active");
        });

        whatsNewModal.addEventListener("click", (e) => {
            if (e.target === whatsNewModal) {
                whatsNewModal.classList.remove("active");
            }
        });

        // Initial setup on page load
        updateCurrentSettingsDisplay();