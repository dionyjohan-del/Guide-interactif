
    <script>
        // --- Gemini API Call Logic via Serverless Function ---
        // This is the relative endpoint for our serverless function when deployed.
        const serverUrl = 'https://guide-interactif.vercel.app/api/coach'; 

        async function callCoachAPI(prompt, type, loader, outputElement) {
            // Show loading animation and clear previous output
            loader.style.display = 'block';
            outputElement.innerHTML = '';
            
            // Prepare the data to be sent to our server
            const payload = {
                prompt: prompt,
                type: type // 'scenario' or 'message'
            };

            try {
                // Call our own serverless function, not the Gemini API directly
                const response = await fetch(serverUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                // Get the AI's response from our server
                const result = await response.json();
                // Use the 'marked' library to convert Markdown text to HTML
                outputElement.innerHTML = marked.parse(result.text);

            } catch (error) {
                console.error('Error calling serverless function:', error);
                outputElement.innerHTML = `<p class="text-red-500">Désolé, impossible de contacter le coach. L'erreur suivante est survenue : ${error.message}</p>`;
            } finally {
                // Hide loading animation regardless of success or failure
                loader.style.display = 'none';
            }
        }

        // --- Event Listeners for the interactive tools ---
        const scenarioSubmit = document.getElementById('scenario-submit');
        const scenarioInput = document.getElementById('scenario-input');
        const scenarioLoader = document.getElementById('scenario-loader');
        const scenarioOutput = document.getElementById('scenario-output');

        scenarioSubmit.addEventListener('click', () => {
            const userInput = scenarioInput.value;
            if (!userInput.trim()) {
                scenarioOutput.innerHTML = `<p class="text-amber-600">Veuillez décrire un scénario avant de demander une analyse.</p>`;
                return;
            }
            callCoachAPI(userInput, 'scenario', scenarioLoader, scenarioOutput);
        });

        const messageSubmit = document.getElementById('message-submit');
        const messageInput = document.getElementById('message-input');
        const messageLoader = document.getElementById('message-loader');
        const messageOutput = document.getElementById('message-output');

        messageSubmit.addEventListener('click', () => {
            const userInput = messageInput.value;
            if (!userInput.trim()) {
                messageOutput.innerHTML = `<p class="text-amber-600">Veuillez entrer un message à raffiner.</p>`;
                return;
            }
            callCoachAPI(userInput, 'message', messageLoader, messageOutput);
        });

        // --- Mobile menu toggle logic ---
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // --- Smooth scrolling for navigation links ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                // Hide mobile menu on click if it's open
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
                const targetElement = document.querySelector(this.getAttribute('href'));
                if(targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    </script>

</body>
</html>

