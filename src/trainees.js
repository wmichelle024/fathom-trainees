'use strict';

import { ruleset, rule, dom, type, score, out } from 'fathom-web';
import { euclidean } from 'fathom-web/clusters';
import { ancestors, isVisible, min, page, sigmoid } from 'fathom-web/utilsForFrontend';
import { types, names } from './constants';

const VIEWPORT_DIMENS = { width: 1100, height: 900 };
const VIEWPORT_SIZE = VIEWPORT_DIMENS.width * VIEWPORT_DIMENS.height;
const IMAGE_EXTENSIONS = ['jpg', 'png', 'gif', 'webp', 'tiff', 'psd', 'raw', 'bmp', 'heif', 'indd', 'svg', 'ai', 'eps', 'pdf']
const MUSIC_KEYWORDS = ['album', 'song', 'music', 'artist', 'genre']

/* General Page Rules */

// Checks for keyword in page URL
// @param element - document
function hasMusicKeywordInURL() {
    let url = document.URL.toLowerCase();
    return MUSIC_KEYWORDS.some(it => url.includes(it));
}

// Checks for keyword in page title   
// @param element - document
function hasMusicKeywordInTitle() {
    let title = document.title.toLowerCase();
    return MUSIC_KEYWORDS.some(it => title.includes(it));
}

// Checks for keyword in search bar placeholder text 
// @param element - input element
function hasMusicSearchBar(element) {
    let placeholder = element.placeholder.toLowerCase();
    return MUSIC_KEYWORDS.some(it => placeholder.includes(it));
}

// Return total size of all images to total size (width * height) of text boxes
function totalImageToTextSizeRatio() {
    let allElem = flattenNodes(document.body);
    console.log("flattened");
    let artSize = 0;
    let textSize = 0;
    for (let e of allElem) {
        if (e.offsetHeight != null && e.offsetWidth != null) {
            if (hasImageAttribute(e)) {
                console.log("found art");
                artSize += e.offsetHeight * e.offsetWidth;
            } else if (e.textContent != null && e.textContent.trim().length > 0) {
                textSize += e.offsetHeight * e.offsetWidth;
            }
        }
    }
    console.log("artsize: " + artSize);
    console.log("textSize: " + textSize);
    return sigmoid(artSize / textSize);
}

// Return count of square images compared to all images on screen
function ratioOfSquareToTotalImgs() {
    // TODO
}

/* Album art Rules */

function byAspectRatio(element) {
    if (!element.offsetWidth || !element.offsetHeight) return 0;

    const bigger = Math.max(element.offsetWidth, element.offsetHeight);
    const smaller = Math.min(element.offsetWidth, element.offsetHeight);

    // TODO calculations are off
    return smaller / bigger;
};

function divIsImage(element) {
    const id = element.id.toLowerCase();
    const classes = [...element.classList].map(it => it.toLowerCase());

    const allClassifiers = [id, ...classes];

    return allClassifiers.some(it => it.includes("image") || it.includes("img") || it.includes("art") || it.includes("album"));
};

function hasImageAttribute(element) {
    const attributes = [...element.attributes];

    for (let ext of IMAGE_EXTENSIONS) {
        for (let attr of attributes) {
            if (attr.value.includes(ext)) return true;
        }
    }
    return false;
}

function getHorizontallyCentered(element) {
    const bodyRect = document.body.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    // const left = elementRect.left - bodyRect.left
    // const right = bodyRect.right - elementRect.right

    // return Math.min(left, right) / Math.max(left, right)

    const center = (bodyRect.right - bodyRect.left) / 2;
    const elementCenter = elementRect.x + ((elementRect.right - elementRect.left) / 2);

    const bigger = Math.max(center, elementCenter);
    const smaller = Math.min(center, elementCenter);

    return 1 - ((bigger - smaller) / center);
}

function sizeToViewport(element) {
    return (element.offsetHeight * element.offsetWidth) / VIEWPORT_SIZE;
}

/* Helper functions */
// TODO: move to a different file?

// Return array of all descendent nodes, including root element
// @param element - root element to flatten
function flattenNodes(element) {
    console.log("flattening");
    let descendents = [];
    let next = [element];
    while (next.length > 0) {
        console.log(next.length);
        let curr = next.shift();
        descendents.push(curr);
        if (curr.children) {
            next = next.concat(Array.from(curr.children));
        }
    }
    return descendents;
}

function makeRuleset() {
    return ruleset([
        // Image
        // Aspect ratio
        // Size
        // Proximity to other elements TODO clustering (?)
        // Horizontally centered
        // id or class with art/album

        // All visible images
        // rule(dom('img').when(isVisible), type(types.ALBUM_ART)),
        // rule(dom('div').when(fnode => divIsImage(fnode.element)), type(types.ALBUM_ART)),

        // // Get largeness compared to viewport
        // rule(
        //     type(types.ALBUM_ART),
        //     score(fnode => sizeToViewport(fnode.element)),
        //     { name: names.ART_AREA }
        // ),
        // // Aspect ratios of images
        // rule(
        //     type(types.ALBUM_ART),
        //     score(fnode => byAspectRatio(fnode.element)),
        //     { name: names.ART_ASPECT_RATIO }
        // ),
        // // get horizontally centered score
        // rule(
        //     type(types.ALBUM_ART),
        //     score(fnode => getHorizontallyCentered(fnode.element)),
        //     { name: names.ART_HORIZONTALLY_CENTERED }
        // ),

        // rule(
        //     type(types.ALBUM_ART),
        //     score(fnode => hasImageAttribute(fnode.element)),
        //     { name: names.HAS_IMG_EXT }
        // ),

        // // Output
        // rule(type(types.ALBUM_ART).max(), out(types.ALBUM_ART))
        // rule (dom('div'), type("music")),
        rule(dom('html'), type(types.MUSIC)),
        rule(type(types.MUSIC), score(page(totalImageToTextSizeRatio)), { name: names.IMG_TEXT_RATIO }),
        rule(type(types.MUSIC), score(page(hasMusicKeywordInTitle)), { name: names.HAS_MUSIC_TITLE })
    ]);
};

const config = new Map();

config.set(
    types.MUSIC,
    {
        coeffs: new Map([
            // [names.ART_ASPECT_RATIO, 1],
            // [names.ART_AREA, 1],
            // [names.ART_HORIZONTALLY_CENTERED, 1],
            // [names.HAS_IMG_EXT, 1]
            [names.HAS_MUSIC_TITLE, 1],
            [names.IMG_TEXT_RATIO, 1]
        ]),
        viewportSize: VIEWPORT_DIMENS,
        vectorType: types.MUSIC,
        rulesetMaker: makeRuleset
    }
);

export default config;


// module.exports = {
//     byAspectRatio: byAspectRatio,
//     divIsImage: divIsImage,
//     getHorizontallyCentered: getHorizontallyCentered,
//     sizeToViewport: sizeToViewport,
//     hasImageAttribute: hasImageAttribute,
//     hasMusicKeywordInTitle: hasMusicKeywordInTitle,
//     hasMusicKeywordInURL: hasMusicKeywordInURL,
//     hasMusicSearchBar: hasMusicSearchBar,
//     totalImageToTextSizeRatio: totalImageToTextSizeRatio

// }
