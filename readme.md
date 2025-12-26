# Bingo Generator - "Orakel Für 2026"

An interactive, static 4x4 bingo card generator deployable to GitHub Pages. Create personalized bingo cards with auto-scaling text, save your progress, and export as PNG images.

## Features

- 🎯 **4x4 Interactive Grid** - Click any cell to add or edit text
- 📝 **Editable Title** - Customize the title (default: "NAME's Orakel Für 2026")
- 🔤 **Auto Text Scaling** - Text automatically adjusts size to fit each cell
- 💾 **Auto-Save** - Your bingo card is saved to browser storage automatically
- 🖼️ **Download as PNG** - Export your completed bingo card as an image
- 🗑️ **Delete All** - Clear everything with a confirmation dialog
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile devices
- ♿ **Accessible** - Keyboard navigation and screen reader support
- 🎨 **Modern Design** - Clean aesthetic with blue accent colors

## How to Use

1. **Edit the Title**: Click on "NAME's Orakel Für 2026" to customize your bingo card title
2. **Fill in Cells**: Click any cell in the 4x4 grid and start typing
3. **Auto-Save**: Your entries are automatically saved to your browser
4. **Download**: Click "📥 Download Image" to save your bingo card as a PNG
5. **Reset**: Click "🗑️ Delete All" to clear everything (you'll be asked to confirm)

### Tips

- **Text Wrapping**: Long text will automatically wrap and scale to fit the cell
- **Paste Support**: You can copy and paste text into cells (formatting is automatically removed)
- **Mobile Friendly**: Touch the cells to edit on your phone or tablet
- **Persistence**: Close and reopen the page - your bingo card will still be there!

## Installation & Deployment

### Local Development

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start creating your bingo cards!

No build process or server needed - it's completely static HTML/CSS/JavaScript.

### Deploy to GitHub Pages

1. **Create a GitHub repository** (if you haven't already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: bingo generator"
   git remote add origin https://github.com/YOUR_USERNAME/bingo_generator.git
   git push -u origin main
   ```

2. **Enable GitHub Pages** in your repository:
   - Go to Settings → Pages
   - Select "Deploy from a branch"
   - Choose `main` branch and `/ (root)` folder
   - Click Save

3. **Access your bingo generator**:
   - Your site will be available at: `https://YOUR_USERNAME.github.io/bingo_generator/`
   - GitHub Pages may take 1-2 minutes to deploy initially

## File Structure

```
bingo_generator/
├── index.html          # Main HTML file with grid structure
├── styles.css          # Responsive styling and layout
├── script.js           # Application logic and interactivity
└── readme.md           # This documentation file
```

## Technologies Used

- **HTML5** - Semantic markup with ARIA labels
- **CSS3** - Responsive design with CSS Grid and custom properties
- **JavaScript (ES6+)** - Pure vanilla JS, no dependencies
- **[fitty.js](https://github.com/rikschennink/fitty)** - Auto text scaling (CDN)
- **[html2canvas](https://html2canvas.hertzen.com/)** - PNG image export (CDN)
- **localStorage** - Browser-based persistence

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Customization

### Change Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4a90e2;        /* Blue accent color */
    --primary-hover: #357abd;        /* Darker blue for hover */
    --cell-bg: #ffffff;              /* Cell background */
    --cell-border: #e0e0e0;          /* Cell border color */
    --text-color: #333333;           /* Text color */
    --hover-color: #f5f5f5;          /* Hover background */
}
```

### Change Default Title

Edit the default title in `index.html`:

```html
<h1 id="bingo-title" class="title" contenteditable="true">YOUR_TITLE_HERE</h1>
```

### Adjust Text Size Range

Edit the fitty configuration in `script.js`:

```javascript
fitty('.bingo-cell', {
    minSize: 12,   // Minimum font size (pixels)
    maxSize: 48,   // Maximum font size (pixels)
    multiLine: true
});
```

## Tips for Best Results

- **Download Quality**: For better resolution when printing, increase the `scale` parameter in the download function (currently set to 2)
- **Long Text**: Use shorter phrases for better readability; the text will auto-scale to fit
- **Mobile**: On mobile devices, the grid auto-scales to fit the screen width
- **Printing**: The CSS includes print styles for optimal output when printing from your browser

## Known Limitations

- Text is stored locally in the browser (localStorage has ~5MB limit per site)
- Clearing browser data will clear saved bingo cards
- Downloaded images are limited by html2canvas rendering capabilities
- Some special characters or emojis may not scale perfectly

## License

Free to use, modify, and share!

## Contributing

This project is intentionally simple and self-contained. Feel free to fork it and customize for your needs.

## Support

If you encounter any issues:

1. Check that JavaScript is enabled in your browser
2. Try clearing browser cache and reloading
3. Test in a different browser
4. Check the browser console (F12) for error messages

---

**Enjoy creating your bingo cards!** 🎉
