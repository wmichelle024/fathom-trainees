import 'babel-polyfill';
import { JSDOM } from 'jsdom';
import * as trainees from '../src/trainees';
import {expect} from 'chai';

const VIEWPORT_DIMENS = { width: 1100, height: 900 };
const VIEWPORT_SIZE = VIEWPORT_DIMENS.width * VIEWPORT_DIMENS.height;

function setProp(elem, property, val) {
    Object.defineProperty(elem, property, {value: val,  configurable: true});
}

describe('test for 1.html', function () {
    
    before(function () {
        this.timeout(200000);
        return JSDOM.fromFile('musicSamples/1.html')
            .then((dom) => {
                global.window = dom.window;
                global.document = window.document;
            });
    })

    // sample test to ensure right file is grabbed
    it('get url', function () {
        expect(document.URL).to.contain('1.html');
    })

    // tests for aspect ratio
    it('check aspect ratio - square', function() {
        let div = document.getElementById('tralbumArt');
        let elem = div.getElementsByTagName('img')[0];
        setProp(elem, 'offsetHeight', 340);
        setProp(elem, 'offsetWidth', 340);
        expect(trainees.byAspectRatio(elem)).to.equal(1);
    })

    it('check aspect ratio - rectangle with bigger width', function() {
        let elem = document.getElementsByClassName('band-photo')[0];
        setProp(elem, 'offsetHeight', 227);
        setProp(elem, 'offsetWidth', 340);
        expect(trainees.byAspectRatio(elem)).to.equal(227 / 340);
    })
    
    it('check aspect ratio - rectangle with bigger height', function() {
        let elem = document.getElementsByClassName('band-photo')[0];
        setProp(elem, 'offsetHeight', 491);
        setProp(elem, 'offsetWidth', 212);
        expect(trainees.byAspectRatio(elem)).to.equal(212 / 491);
    })

});

describe('test for 2.html', function () {
    
    before(function () {
        this.timeout(200000);
        return JSDOM.fromFile('musicSamples/2.html')
            .then((dom) => {
                global.window = dom.window;
                global.document = window.document;
            });
    })

    // sample test to ensure right file is grabbed
    it('get url', function () {
        expect(document.URL).to.contain('2.html');
    })

    // test for divIsImage
    it('check that div with image is in bucket - returns true', function() {
        let div = document.getElementsByClassName("sound__artworkImage")[0]
        expect(trainees.divIsImage(div)).to.be.true;
    })

    it('check that div is not in bucket - returns false', function() {
        let div = document.getElementsByClassName("upsellBanner")[0]
        expect(trainees.divIsImage(div)).to.be.false;
    })

    //test for hasImageAttribute
    it('return false - does not have img ext', function() {
        let div = document.getElementsByClassName('sound__artwork')[0];
        expect(trainees.hasImageAttribute(div)).to.be.false;
    })

    it('return true - does have img ext', function() {
        let div = document.getElementsByClassName('sound__artworkImage')[0];
        expect(trainees.hasImageAttribute(div)).to.be.true;
    })

});

