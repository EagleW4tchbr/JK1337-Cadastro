document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch all JSON parts and merge them
    const fetchAllData = async () => {
        const data = [];
        let partIndex = 1;
        
        // Continue fetching files as long as they exist
        while (true) {
            try {
                const response = await fetch(`data_cadastro/data_part_${partIndex}.json`);
                if (!response.ok) throw new Error('File not found');
                
                const partData = await response.json();
                data.push(...partData); // Merge the data from each part
                partIndex++;
            } catch (err) {
                // Break the loop if no more files are found
                console.log(`No more parts found. Error: ${err.message}`);
                break;
            }
        }
        return data;
    };

    // Fetch and process all data parts
    fetchAllData()
        .then(data => {
            const content = document.getElementById('content');
            content.innerHTML = ''; // Clear loading message

            // Process each item from the merged data
            data.forEach(item => {
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

                // Append the section to the content container
                content.appendChild(section);
            });
        })
        .catch(err => {
            console.error('Error loading data:', err);
            document.getElementById('content').innerHTML = '<p>Failed to load content.</p>';
        });
});
