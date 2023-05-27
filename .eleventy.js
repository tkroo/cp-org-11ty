/**
*  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
*/

const slugify = require('slugify');
const _ = require('lodash');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const { URL } = require("url");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPassthroughCopy({
        "src/_assets/images/favicon.ico": "favicon.ico",
        "src/_assets/css": "assets/css",
        "src/_assets/images": "assets/images",
        "src/_assets/javascript": "assets/javascript",
    });

    // eleventyConfig.addFilter("absoluteUrl", (path) => {
    //     return new URL(path, metadata.url).toString();
    // });

    eleventyConfig.addFilter("findme", function(arr, value) {
        return arr.find(x => x.id === value);
    })

    eleventyConfig.addFilter("relative_url", function(value) {
        return value
    })
    eleventyConfig.addFilter("slugify", function(value) {
        return slugify(value, '_');
    })

    eleventyConfig.addFilter("combinedata", function(obj, value) {
        obj.data["downloads"] = value+""
        return obj
    })

    eleventyConfig.addFilter("mergeData", function(obj, obj2) {
        const obj3 = _.merge(obj, obj2);
        return obj3;
    })

    // eleventyConfig.addCollection("boardswithdownloads", function (collectionApi) {
    //     const a = collectionApi.getFilteredByTag("board");
    //     const b = collectionApi.getAll()[0].data.files;
    //     const c = a.map(x => {
    //         dl = b.find(y => y.id === x.data.board_id);
    //         console.log("dl:", dl.downloads);
    //         return {
    //             ...x,
    //             downloads: dl.downloads | 0
    //         }
    //     })
    //     console.log("c:", c);
    //     return c
    // });
    return {
        dir: {
            input: "src",
            output: "_site",
        }
    }
}