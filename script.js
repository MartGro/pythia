// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeBingoApp();
});

function initializeBingoApp() {
    const cells = document.querySelectorAll('.bingo-cell');
    const titleElement = document.getElementById('bingo-title');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Initialize fitty for cells and title (with error handling)
    try {
        if (typeof fitty !== 'undefined') {
            fitty('.bingo-cell', {
                minSize: 10,
                maxSize: 40,
                multiLine: true,
                hasParent: true
            });

            fitty('.title', {
                minSize: 14,
                maxSize: 48,
                multiLine: false,
                hasParent: true
            });
        }
    } catch (error) {
        console.warn('Fitty.js error:', error);
    }

    // Load saved state from localStorage
    loadBingoState(titleElement, cells);

    // Add event listeners to all cells
    cells.forEach((cell, index) => {
        // Input event for text changes
        cell.addEventListener('input', (e) => {
            sanitizeContent(e.target);
            try {
                if (typeof fitty !== 'undefined') {
                    fitty('.bingo-cell');
                }
            } catch (error) {
                console.warn('Fitty error on cell input:', error);
            }
            saveBingoState(titleElement, cells);
        });

        // Paste event to handle formatting
        cell.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });

        // Handle contenteditable quirks
        cell.addEventListener('keydown', (e) => {
            // Allow Ctrl+A to select all in cell
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.stopPropagation();
            }
        });
    });

    // Add event listeners to title
    titleElement.addEventListener('input', (e) => {
        sanitizeContent(e.target);
        try {
            if (typeof fitty !== 'undefined') {
                fitty('.title');
            }
        } catch (error) {
            console.warn('Fitty error on title input:', error);
        }
        saveBingoState(titleElement, cells);
    });

    titleElement.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });

    // Delete all button
    deleteAllBtn.addEventListener('click', () => {
        deleteAll(titleElement, cells);
    });

    // Download button
    downloadBtn.addEventListener('click', async () => {
        await downloadAsImage();
    });
}

/**
 * Sanitize cell content by removing unwanted HTML elements
 */
function sanitizeContent(element) {
    // Remove any HTML tags and keep only text
    let text = element.innerText || element.textContent || '';
    element.textContent = text;
}

/**
 * Save bingo state to localStorage
 */
function saveBingoState(titleElement, cells) {
    const title = titleElement.textContent || '';
    const cellsData = Array.from(cells).map(cell => cell.textContent || '');

    const state = {
        title: title,
        cells: cellsData
    };

    localStorage.setItem('bingoState', JSON.stringify(state));
}

/**
 * Load bingo state from localStorage
 */
function loadBingoState(titleElement, cells) {
    const savedState = localStorage.getItem('bingoState');

    if (savedState) {
        try {
            const state = JSON.parse(savedState);

            // Load title
            if (state.title) {
                titleElement.textContent = state.title;
            }

            // Load cells
            if (state.cells && Array.isArray(state.cells)) {
                cells.forEach((cell, index) => {
                    if (state.cells[index]) {
                        cell.textContent = state.cells[index];
                    }
                });
            }

            // Re-fit all cells after loading
            setTimeout(() => {
                try {
                    if (typeof fitty !== 'undefined') {
                        fitty('.bingo-cell');
                        fitty('.title');
                    }
                } catch (error) {
                    console.warn('Fitty error on load:', error);
                }
            }, 100);
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    }
}

/**
 * Delete all content with confirmation
 */
function deleteAll(titleElement, cells) {
    const confirmed = window.confirm(
        'Are you sure you want to delete all text? This cannot be undone.'
    );

    if (confirmed) {
        // Clear title
        titleElement.textContent = "NAME's Orakel Für 2026";

        // Clear all cells
        cells.forEach(cell => {
            cell.textContent = '';
        });

        // Re-fit text
        try {
            if (typeof fitty !== 'undefined') {
                fitty('.title');
                fitty('.bingo-cell');
            }
        } catch (error) {
            console.warn('Fitty error on delete:', error);
        }

        // Clear localStorage
        localStorage.removeItem('bingoState');
    }
}

/**
 * Download bingo grid as PNG image
 */
async function downloadAsImage() {
    try {
        const grid = document.querySelector('.bingo-grid');
        const container = document.querySelector('.container');
        const downloadBtn = document.getElementById('download-btn');
        const controls = document.querySelector('.controls');

        // Temporarily hide controls during capture
        controls.style.display = 'none';

        // Wait for fonts to be loaded
        if (document.fonts) {
            await document.fonts.ready;
        }

        // Create a wrapper to capture title + grid
        const captureElement = document.createElement('div');
        captureElement.style.padding = '20px';
        captureElement.style.backgroundColor = '#f9f9f9';
        captureElement.style.borderRadius = '8px';

        // Clone title and grid
        const titleClone = document.getElementById('bingo-title').cloneNode(true);
        const gridClone = grid.cloneNode(true);

        captureElement.appendChild(titleClone);
        captureElement.appendChild(gridClone);

        // Temporarily add to DOM for rendering
        document.body.appendChild(captureElement);

        // Capture the canvas
        const canvas = await html2canvas(captureElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
        });

        // Remove temporary element
        document.body.removeChild(captureElement);

        // Show controls again
        controls.style.display = 'flex';

        // Create download link
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `bingo-orakel-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

    } catch (error) {
        console.error('Error downloading image:', error);
        alert('Failed to download image. Please try again.');

        // Make sure controls are visible again
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.style.display = 'flex';
        }
    }
}

// Handle window resize to re-fit text
window.addEventListener('resize', () => {
    if (document.querySelector('.bingo-cell')) {
        try {
            if (typeof fitty !== 'undefined') {
                fitty('.bingo-cell');
                fitty('.title');
            }
        } catch (error) {
            console.warn('Fitty error on resize:', error);
        }
    }
});
