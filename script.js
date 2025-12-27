// Store fitty instances globally
let cellFittyInstances = [];
let titleFittyInstance = null;

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
            // Initialize fitty for each cell individually
            cells.forEach(cell => {
                const instance = fitty(cell, {
                    minSize: 8,
                    maxSize: 40,
                    multiLine: true,
                    observeMutations: {
                        subtree: true,
                        childList: true,
                        characterData: true
                    }
                });
                cellFittyInstances.push(instance);
            });

            // Initialize fitty for title
            titleFittyInstance = fitty(titleElement, {
                minSize: 14,
                maxSize: 48,
                multiLine: false,
                observeMutations: {
                    subtree: true,
                    childList: true,
                    characterData: true
                }
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
            // Use requestAnimationFrame to ensure DOM is updated before fitting
            requestAnimationFrame(() => {
                try {
                    if (cellFittyInstances[index]) {
                        cellFittyInstances[index].fit();
                    }
                } catch (error) {
                    console.warn('Fitty error on cell input:', error);
                }
            });
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
            if (titleFittyInstance) {
                titleFittyInstance.fit();
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
    // Only sanitize if there are actual HTML elements
    if (element.children.length > 0) {
        // Save cursor position
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const cursorOffset = range ? range.startOffset : 0;
        const anchorNode = range ? range.startContainer : null;

        // Remove any HTML tags and keep only text
        let text = element.innerText || element.textContent || '';
        element.textContent = text;

        // Restore cursor position
        if (anchorNode && element.firstChild) {
            try {
                const newRange = document.createRange();
                const textNode = element.firstChild;
                const offset = Math.min(cursorOffset, textNode.length);
                newRange.setStart(textNode, offset);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } catch (e) {
                // If restoration fails, just continue
            }
        }
    }
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
                    cellFittyInstances.forEach(instance => {
                        if (instance) {
                            instance.fit();
                        }
                    });
                    if (titleFittyInstance) {
                        titleFittyInstance.fit();
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
            cellFittyInstances.forEach(instance => {
                if (instance) {
                    instance.fit();
                }
            });
            if (titleFittyInstance) {
                titleFittyInstance.fit();
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

        // Create a wrapper to capture title + grid at 1024x1024
        const targetSize = 1024;
        const padding = 40;
        const gridSize = targetSize - (padding * 2);

        const captureElement = document.createElement('div');
        captureElement.style.width = `${targetSize}px`;
        captureElement.style.height = `${targetSize}px`;
        captureElement.style.padding = `${padding}px`;
        captureElement.style.backgroundColor = '#f9f9f9';
        captureElement.style.borderRadius = '8px';
        captureElement.style.display = 'flex';
        captureElement.style.flexDirection = 'column';
        captureElement.style.justifyContent = 'center';
        captureElement.style.gap = '20px';
        captureElement.style.boxSizing = 'border-box';

        // Clone title and grid
        const titleClone = document.getElementById('bingo-title').cloneNode(true);
        const gridClone = grid.cloneNode(true);

        // Ensure cloned elements are properly sized
        titleClone.style.width = '100%';
        titleClone.style.textAlign = 'center';
        titleClone.style.fontSize = '48px';
        titleClone.style.marginBottom = '0';

        gridClone.style.width = `${gridSize}px`;
        gridClone.style.height = `${gridSize}px`;
        gridClone.style.maxWidth = 'none';
        gridClone.style.aspectRatio = '1 / 1';

        captureElement.appendChild(titleClone);
        captureElement.appendChild(gridClone);

        // Temporarily add to DOM for rendering (positioned off-screen)
        captureElement.style.position = 'absolute';
        captureElement.style.left = '-9999px';
        document.body.appendChild(captureElement);

        // Capture the canvas at exact 1024x1024
        const canvas = await html2canvas(captureElement, {
            backgroundColor: '#ffffff',
            scale: 1,
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: targetSize,
            height: targetSize
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
    try {
        cellFittyInstances.forEach(instance => {
            if (instance) {
                instance.fit();
            }
        });
        if (titleFittyInstance) {
            titleFittyInstance.fit();
        }
    } catch (error) {
        console.warn('Fitty error on resize:', error);
    }
});
