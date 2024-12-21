document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch all JSON parts and merge them
    const fetchAllData = async () => {
        const data = [];
        let partIndex = 1;
        const totalParts = 5; // Modify this to the number of parts your data has
        
        // Continue fetching files as long as they exist
        while (partIndex <= totalParts) {
            try {
                const response = await fetch(`data_cadastro/data_part_${partIndex}.json`);
                if (!response.ok) throw new Error('File not found');
                
                const partData = await response.json();
                data.push(...partData); // Merge the data from each part
                partIndex++;
                console.log(`Loading part: ${partIndex}`);
                updateProgressBar(partIndex, totalParts); // Update progress bar
            } catch (err) {
                console.log(`No more parts found or error: ${err.message}`);
                break;
            }
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
            };

            // Initial render
            renderPage(currentPage);

            // Handle next page button
            document.getElementById('next-page').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPage(currentPage);
                }
            });

            // Handle previous page button
            document.getElementById('prev-page').addEventListener('click', () => {
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
