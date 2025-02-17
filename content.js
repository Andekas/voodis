// Configuration for different news sites
const SITE_CONFIGS = {
    'postimees.ee': {
        headlineSelectors: [
            '.video-story__headline',
            '.list-article__headline',
            '[itemprop="headline"]',
            '.article__headline',
            '.top-article__headline',
            'h2.list-article__blockquote', 
            '.future-event__content__headline'
        ],
    },
    'reporter.kanal2.ee': {
        headlineSelectors: [
            '.video-story__headline',
            '.list-article__headline',
            '[itemprop="headline"]',
            '.article__headline',
            '.top-article__headline',
            'h2.list-article__blockquote', 
            '.future-event__content__headline'
        ],
    },
    'delfi.ee': {
        headlineSelectors: [
            '.headline-title a:first-of-type', 
            '.article-info__title',
            'h1',
            'h5.headline-title'
        ],
    },
    'err.ee': {
        headlineSelectors: [
            'h2 span:not(.extra-header)',
            'h2.news-article a',
            'h1:not(.block-header-small):not(.block-header)',
            'article h2',
     ],
    },
    'uueduudised.ee': {
        headlineSelectors: [
            'h1', 'h4', '.uu-list-title'
        ],
    },
    'ohtuleht.ee': {
        headlineSelectors: [
            'h6 a:first-of-type', 
            '.article p.title', 
            'h1', 'h2',
            '.content-marketing-unit--content a', 
            '.sth-list--title a:first-of-type',
            '.videos--item-content',
            'p.title',
            '.related-articles-item--name a:first-of-type',
        ],
    },
    'telegram.ee': {
        headlineSelectors: ['h2', 'h3'],
    }
};

// Function to add "voodis" to text
function addVoodis(text) {
    // Don't add if it already contains "voodis"
    if (text.trim().includes('voodis')) {
        return text;
    }

    // Standardize quotes first - replace all quote variants with standard quotes
    let trimmedText = text.trim()
    .replace(/[“]/g, '"') // closing quotes (both types)
        .replace(/[„]/g, '"')    // opening quote
        .replace(/[""]/g, '"');  // closing quotes

    // Handle text with punctuation followed by quotes
    // Example: "Karjääripööre viis maailma vanima ameti juurde. "Sinu mees ei peta sind kunagi prostituudiga.""
    const punctBeforeQuoteMatch = trimmedText.match(/^(.+?)([.!?,…]+)\s*(["«])(.*?)([.!?,…]+)?(["»])(\s*\([^)]+\))?\s*$/);
    if (punctBeforeQuoteMatch) {
        const [_, mainText, firstPunct, openQuote, quoteContent, punctuation = '', closeQuote, parentheses = ''] = punctBeforeQuoteMatch;
        // Convert back to original quote style if it was „"
        if (text.includes('„')) {
            return `${mainText}${firstPunct} „${quoteContent} voodis${punctuation}"${parentheses}`;
        }
        return `${mainText}${firstPunct} ${openQuote}${quoteContent} voodis${punctuation}${closeQuote}${parentheses}`;
    }

    // Handle text with colon followed by quotes
    // Example: '25 AASTAT SÕPRUST! Näitleja: "Elada tuleb nüüd ja praegu!"'
    const colonQuoteMatch = trimmedText.match(/^(.+?:\s*)(["«])(.*?)([.!?,…]+)?(["»])(\s*\([^)]+\))?\s*$/);
    if (colonQuoteMatch) {
        const [_, mainText, openQuote, quoteContent, punctuation = '', closeQuote, parentheses = ''] = colonQuoteMatch;
        // Convert back to original quote style if it was „"
        if (text.includes('„')) {
            return `${mainText}„${quoteContent} voodis${punctuation}"${parentheses}`;
        }
        return `${mainText}${openQuote}${quoteContent} voodis${punctuation}${closeQuote}${parentheses}`;
    }

    // Handle text with quotes before and after vertical bar
    // Example: '"HOMMIKUSÖÖK STAARIGA" | Mart Müürisepp: "Olingi loll!"'
    const barQuoteMatch = trimmedText.match(/^(["«])(.*?)(["»])\s*\|\s*(.+?)(["«])(.*?)([.!?,…]+)?(["»])(\s*\([^)]+\))?\s*$/);
    if (barQuoteMatch) {
        const [_, firstOpenQuote, firstContent, firstCloseQuote, mainText, secondOpenQuote, secondContent, punctuation = '', secondCloseQuote, parentheses = ''] = barQuoteMatch;
        // Convert back to original quote style if it was „"
        if (text.includes('„')) {
            return `„${firstContent} voodis" | ${mainText}„${secondContent} voodis${punctuation}"${parentheses}`;
        }
        return `${firstOpenQuote}${firstContent} voodis${firstCloseQuote} | ${mainText}${secondOpenQuote}${secondContent} voodis${punctuation}${secondCloseQuote}${parentheses}`;
    }

    // Handle text with special characters, quotes and optional parentheses at the end
    // Example: 'OTSEBLOGI MÜNCHENIST ⟩ «Hegsethi sõnum oli.» (43)'
    const specialCharQuoteMatch = trimmedText.match(/^(.+?)(?:\s*[|⟩⟨»«]+\s*)(["«])(.*?)([.!?,…]+)?(["»])(\s*\([^)]+\))?\s*$/);
    if (specialCharQuoteMatch) {
        const [_, mainText, openQuote, quoteContent, punctuation = '', closeQuote, parentheses = ''] = specialCharQuoteMatch;
        // Convert back to original quote style if it was „"
        if (text.includes('„')) {
            return `${mainText} „${quoteContent} voodis${punctuation}"${parentheses}`;
        }
        return `${mainText} ${openQuote}${quoteContent} voodis${punctuation}${closeQuote}${parentheses}`;
    }

    // Handle text with quotes and optional parentheses
    // Example: «Hegsethi sõnum oli, et eurooplased ei saa USA-le loota.» (43)
    const quoteMatch = trimmedText.match(/^(["«])(.*?)([.!?,…]+)?(["»])(\s*\([^)]+\))?\s*$/);
    if (quoteMatch) {
        const [_, openQuote, content, punctuation = '', closeQuote, parentheses = ''] = quoteMatch;
        // Convert back to original quote style if it was „"
        if (text.includes('„')) {
            return `„${content} voodis${punctuation}"${parentheses}`;
        }
        return `${openQuote}${content} voodis${punctuation}${closeQuote}${parentheses}`;
    }

    // Handle text ending with both punctuation and parentheses
    // Example: "Text! (1)" -> "Text voodis! (1)"
    const punctParenMatch = trimmedText.match(/^(.+?)([.!?,…]+)(\s*\([^)]+\))$/);
    if (punctParenMatch) {
        const [_, mainText, punctuation, parentheses] = punctParenMatch;
        return `${mainText} voodis${punctuation}${parentheses}`;
    }

    // Handle text ending with parentheses
    // Example: "Text (video)" -> "Text voodis (video)"
    const parenthesesMatch = trimmedText.match(/^(.+?)\s*(\([^)]+\))$/);
    if (parenthesesMatch) {
        return `${parenthesesMatch[1]} voodis ${parenthesesMatch[2]}`;
    }
    
    // Handle text ending with punctuation
    // Example: "Text!" -> "Text voodis!"
    const punctuationMatch = trimmedText.match(/^(.+?)([.!?,…]+)$/);
    if (punctuationMatch) {
        return `${punctuationMatch[1]} voodis${punctuationMatch[2]}`;
    }
    
    // Default case: add to the end
    return `${trimmedText} voodis`;
}

// Function to check if headline needs reprocessing
function checkForRemovedVoodis(headline) {
    const text = headline.textContent.trim();
    if (headline.dataset.voodisProcessed && !text.endsWith('voodis')) {
        // If the headline was processed but doesn't end with 'voodis' anymore,
        // remove the processed flag to allow reprocessing
        delete headline.dataset.voodisProcessed;
        return true;
    }
    return false;
}

// Function to process headlines
function processHeadlines() {
    // Determine current site
    const currentSite = Object.keys(SITE_CONFIGS).find(site => 
        window.location.hostname.includes(site)
    );

    if (!currentSite) return;

    // Get relevant selectors for current site
    const selectors = SITE_CONFIGS[currentSite].headlineSelectors;
    
    // Process each selector
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(headline => {
            // Check if 'voodis' was removed from a processed headline
            checkForRemovedVoodis(headline);
            
            // Check if the headline or its parent has been processed
            if (!headline.dataset.voodisProcessed) {
                // For delfi.ee, handle both direct text and anchor tags
                if (currentSite === 'delfi.ee') {
                    const targetElement = headline.tagName.toLowerCase() === 'a' ? headline : headline.querySelector('a');
                    if (targetElement) {
                        checkForRemovedVoodis(targetElement);
                        targetElement.textContent = addVoodis(targetElement.textContent);
                    } else {
                        headline.textContent = addVoodis(headline.textContent);
                    }
                } else {
                    headline.textContent = addVoodis(headline.textContent);
                }
                headline.dataset.voodisProcessed = 'true';
            }
        });
    });
}

// Run on page load
processHeadlines();

// Enhanced MutationObserver configuration
const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    
    // Check if any relevant changes occurred
    for (const mutation of mutations) {
        // Check for added nodes
        if (mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element node
                    shouldProcess = true;
                    break;
                }
            }
        }
        // Check for text content changes
        if (mutation.type === 'characterData' && mutation.target.parentElement) {
            const parentElement = mutation.target.parentElement;
            if (parentElement.dataset.voodisProcessed) {
                checkForRemovedVoodis(parentElement);
                shouldProcess = true;
            }
        }
        // Check for attribute changes on existing nodes
        if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
            if (mutation.target.dataset.voodisProcessed) {
                checkForRemovedVoodis(mutation.target);
            }
            shouldProcess = true;
        }
        if (shouldProcess) break;
    }
    
    // Only process if relevant changes were detected
    if (shouldProcess) {
        processHeadlines();
    }
});

// Watch for both content and attribute changes
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id'], // Only watch for relevant attribute changes
    characterData: true, // Watch for text content changes
    characterDataOldValue: true // Keep old value to detect changes
}); 