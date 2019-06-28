import { ruleset, rule, dom, type, score, out } from 'fathom-web';
import { euclidean } from 'fathom-web/clusters';
import { ancestors, isVisible, min } from 'fathom-web/utilsForFrontend';

const VIEWPORT_SIZE = { width: 1100, height: 900 };

const ALBUM_ART = 'albumArt';
const ART_ASPECT_RATIO = 'artAspectRatio';

function getAspectRatio() {
    return score(fnode => {
        const element = fnode.element;
        const bigger = Math.max(element.width, element.height);
        const smaller = Math.min(element.width, element.height);

        return smaller / bigger
    });
};

function makeRuleset() {
    return ruleset([
        // Image
        // Aspect ratio
        // Size
        // Proximity to other elements TODO
        // Horizontally centered

        // All visible images
        rule(dom('img').when(isVisible), type(ALBUM_ART)),
        // Aspect ratios of images
        rule(
            type(ALBUM_ART),
            getAspectRatio(),
            { name: ART_ASPECT_RATIO }),

        // Output
        rule(type(ALBUM_ART), out(ALBUM_ART))
    ])
};

const config = new Map();

config.set(
    ALBUM_ART,
    {
        coeffs: new Map([
            [ART_ASPECT_RATIO, 1]
        ]),
        viewportSize: VIEWPORT_SIZE,
        vectorType: ALBUM_ART,
        rulesetMaker: makeRuleset
    }
);

export default config;
