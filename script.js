document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch all JSON parts dynamically
    const fetchAllData = async () => {
        const data = [];
        let partIndex = 1;
        let totalParts = 0;

        // Attempt to fetch parts one by one
        while (true) {
            try {
                const fileName = `data_cadastro/data_part_${partIndex}.json`;
                const response = await fetch(fileName);

                // If the response is OK, parse and append the data
                if (response.ok) {
                    const partData = await response.json();
                    data.push(...partData); // Merge the data from each part
                    totalParts++; // Increment the total parts count
                    console.log(`Loading part: ${partIndex}`); // Log part before incrementing
                } else {
                    throw new Error('File not found');
                }
            } catch (err) {
                console.log(`No more parts to load. Total parts loaded: ${totalParts}`);
                break; // Exit the loop when no more parts are found
            }
            partIndex++;  // Increment partIndex after each attempt
            updateProgressBar(partIndex - 1, totalParts); // Update progress bar with the current part count
        }

        return data;
    };

    // Update the progress bar
    const updateProgressBar = (current, total) => {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        const percent = (current / total) * 100;
        progressBar.value = percent;
        progressText.textContent = `${Math.round(percent)}% Loaded`;
    };

    // Fetch and process all data parts
    fetchAllData()
        .then(data => {
            const content = document.getElementById('content');
            content.innerHTML = ''; // Clear loading message

            // Pagination state
            const entriesPerPage = 20;
            let currentPage = 1;
            const totalPages = Math.ceil(data.length / entriesPerPage);

            // Function to render current page data
            const renderPage = (page) => {
                const start = (page - 1) * entriesPerPage;
                const end = page * entriesPerPage;
                const pageData = data.slice(start, end);

                content.innerHTML = ''; // Clear current content

                pageData.forEach(item => {
                    const section = document.createElement('section');
                    section.classList.add('subfolder-section'); // Add a class for styling

                    // Split the text into individual lines and filter out empty lines
                    const musicList = item.text.split('\n')
                        .filter(Boolean)  // Removes empty lines
                        .map(music => `<li>${music}</li>`) // Wrap each item in a <li>
                        .join('');

                    // Create the HTML for each subfolder (name, image, and music list)
                    section.innerHTML = `
                        <h2>${item.name}</h2>
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                        <h3>Musics:</h3>
                        <ul>${musicList}</ul>
                    `;

                    content.appendChild(section);
                });

                // Scroll to top when page changes
                window.scrollTo(0, 0);

                // Update the page navigation buttons
                document.getElementById('prev-page').disabled = currentPage === 1;
                document.getElementById('next-page').disabled = currentPage === totalPages;
                document.getElementById('prev-page-bottom').disabled = currentPage === 1;
                document.getElementById('next-page-bottom').disabled = currentPage === totalPages;
            };

            // Initial render
            renderPage(currentPage);

            // Handle next page button (top)
            document.getElementById('next-page').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPage(currentPage);
                }
            });

            // Handle previous page button (top)
            document.getElementById('prev-page').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderPage(currentPage);
                }
            });

            // Handle next page button (bottom)
            document.getElementById('next-page-bottom').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPage(currentPage);
                }
            });

            // Handle previous page button (bottom)
            document.getElementById('prev-page-bottom').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderPage(currentPage);
                }
            });
        })
        .catch(err => {
            console.error('Error loading data:', err);
            document.getElementById('content').innerHTML = '<p>Failed to load content.</p>';
        });
});
