let data = [];
document.addEventListener('DOMContentLoaded', () => {
    
 const header = document.querySelector("header");
    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
        if (window.scrollY > lastScrollY) {
            header.classList.add("hidden");
        } else {
            header.classList.remove("hidden");
        }
        lastScrollY = window.scrollY;
    });
    
    const fetchAllData = async () => {
       
        let partIndex = 1;
        let totalParts = 0;

        // First, determine how many parts we need by checking the files.
        while (true) {
            const fileName = `data_cadastro/data_part_${partIndex}.json`;
            const response = await fetch(fileName);

            // If the response is OK, we have a part, so we increment the total parts
            if (response.ok) {
                totalParts++;
                partIndex++;
            } else {
                break; // No more parts found, exit loop
            }
        }

        console.log(`Total parts to load: ${totalParts}`);
        partIndex = 1;
        let currentPart = 0;

        // Fetch and render parts
        const fetchAndRenderPart = async (index) => {
            const fileName = `data_cadastro/data_part_${index}.json`;
            const response = await fetch(fileName);
            
            if (response.ok) {
                const partData = await response.json();
                data.push(...partData);
                renderDataPart(partData);
                currentPart++;
                updateProgressBar(currentPart, totalParts);
                return true;
            }
            return false;
        };

        const firstPartLoaded = await fetchAndRenderPart(partIndex);
        if (!firstPartLoaded) {
            console.error("Failed to load the first part.");
            return data;
        }

        while (partIndex <= totalParts) {
            const fetched = await fetchAndRenderPart(partIndex);
            if (!fetched) break;
            partIndex++;
        }

        updateProgressBar(totalParts, totalParts);
        return data;
    };

    // Render part data
    const renderDataPart = (partData) => {
        const content = document.getElementById('content');
        partData.forEach(item => {
            const section = document.createElement('section');
            section.classList.add('subfolder-section');

            const musicList = item.text.split('\n')
                .filter(Boolean)
                .map(music => `<li>${music}</li>`)
                .join('');

            section.innerHTML = `
                <h2>${item.name}</h2>
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <h3>Músicas:</h3>
                <ul>${musicList}</ul>
            `;
            content.appendChild(section);
        });
    };

    // Update progress bar
    const updateProgressBar = (current, total) => {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');

        if (progressBar && progressText) {
            const percent = (current / total) * 100;
            progressBar.value = percent;
            progressText.textContent = `${Math.round(percent)}%`;
        }
    };

    // Create A-Z navigation
    const createLetterNavigation = (data) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const letterNav = document.getElementById('letter-nav');
        alphabet.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.addEventListener('click', () => goToPageForLetter(letter, data));
            letterNav.appendChild(button);
        });
    };

    // Go to the page that has subfolder starting with the clicked letter
const goToPageForLetter = (letter, data) => {
    // Find the first subfolder name starting with that letter
    let targetIndex = -1;
    for (let i = 0; i < data.length; i++) {
        if (data[i].name.toUpperCase().startsWith(letter)) {
            targetIndex = i;
            break;
        }
    }

    if (targetIndex === -1) {
        console.log(`No subfolder found starting with letter ${letter}`);
        return;
    }

    // Calculate which page the subfolder is on
    const entriesPerPage = 20;
    const pageNumber = Math.floor(targetIndex / entriesPerPage) + 1;

    // Jump to the correct page and scroll to the subfolder
    jumpToPage(pageNumber, targetIndex);
};

   // Jump to the specified page and scroll to the selected subfolder
const jumpToPage = (page, targetIndex) => {
    const content = document.getElementById('content');
    const entriesPerPage = 20;
    const start = (page - 1) * entriesPerPage;
    const end = page * entriesPerPage;

    // Clear existing content
    content.innerHTML = '';

    // Fetch and display the required data
    const pageData = data.slice(start, end);
    pageData.forEach(item => {
        const section = document.createElement('section');
        section.classList.add('subfolder-section');

        const musicList = item.text.split('\n')
            .filter(Boolean)
            .map(music => `<li>${music}</li>`)
            .join('');

        section.innerHTML = `
            <h2>${item.name}</h2>
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <h3>Músicas:</h3>
            <ul>${musicList}</ul>
        `;
        content.appendChild(section);
    });

    // Wait until content is rendered, then scroll to the subfolder if needed
    const scrollToSubfolder = () => {
        const subfolderElements = content.querySelectorAll('.subfolder-section');
        const targetSubfolder = subfolderElements[targetIndex % entriesPerPage];

        if (targetSubfolder) {
            targetSubfolder.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    };

    // Ensure the scroll happens after the page is rendered using requestAnimationFrame
    requestAnimationFrame(scrollToSubfolder);

    window.scrollTo(0, 0); // Optionally scroll to the top of the page
};


    fetchAllData()
        .then(data => {
            const content = document.getElementById('content');
            content.innerHTML = '';  // Clear loading message
            const entriesPerPage = 20;
            let currentPage = 1;
            const totalPages = Math.ceil(data.length / entriesPerPage);


            

            const renderPage = (page) => {
                const start = (page - 1) * entriesPerPage;
                const end = page * entriesPerPage;
                const pageData = data.slice(start, end);
                
                content.innerHTML = '';
                pageData.forEach(item => {
                    const section = document.createElement('section');
                    section.classList.add('subfolder-section');

                    const musicList = item.text.split('\n')
                        .filter(Boolean)
                        .map(music => `<li>${music}</li>`)
                        .join('');

                    section.innerHTML = `
                        <h2>${item.name}</h2>
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                        <h3>Músicas:</h3>
                        <ul>${musicList}</ul>
                    `;
                    content.appendChild(section);
                });

                window.scrollTo(0, 0);
                 // Update the page navigation buttons
                 document.getElementById('prev-page').disabled = currentPage === 1;
                 document.getElementById('next-page').disabled = currentPage === totalPages;
                 document.getElementById('prev-page-bottom').disabled = currentPage === 1;
                 document.getElementById('next-page-bottom').disabled = currentPage === totalPages;
            };

            renderPage(currentPage);

            document.getElementById('next-page').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPage(currentPage);
                }
            });

            document.getElementById('prev-page').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderPage(currentPage);
                }
            });


            document.getElementById('next-page-bottom').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPage(currentPage);
                }
            });

            document.getElementById('prev-page-bottom').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderPage(currentPage);
                }
            });
            // Add home button logic
            const homeButton = document.getElementById('home-button');
            homeButton.addEventListener('click', () => {
                currentPage = 1;
                renderPage(currentPage);

                // Update navigation button states
                document.getElementById('prev-page').disabled = true;
                document.getElementById('next-page').disabled = totalPages <= 1;
            });

            createLetterNavigation(data);  // Create the A-Z navigation

        })
        .catch(err => {
            console.error('Error loading data:', err);
            document.getElementById('content').innerHTML = '<p>Failed to load content.</p>';
        });
});
