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

    eleventyConfig.addFilter("sortByDownloads", function(arr) {
        return arr.filter(x => x.info).sort((a, b) => {
            if (a?.info.downloads < b?.info.downloads) return 1;
            if (a?.info.downloads > b?.info.downloads) return -1;
            return 0;
        }).concat(arr.filter(x => !x.info))
    })

    eleventyConfig.addCollection("missingMDfiles", function(collectionApi) {
        const c1 = collectionApi.getFilteredByTag("board");
        const c2 = collectionApi.getAll()[0].data.files;

        return c2.filter(function(item) {
            return !c1.find(x => (x.data.board_id === item.id || x.data.board_alias === item.id));
        })
    })

    eleventyConfig.addCollection("filteredBoards", function(collectionApi) {
        const c1 = collectionApi.getFilteredByTag("board");
        const c2 = collectionApi.getAll()[0].data.files;

        const hasMarkdownAndBoardImage = c1.filter(function(item) {
            return item.data.board_image != "unknown.jpg";
        });

        const addFileInfo = c1.map(item => {
            item.info = c2.find(x => x.id === item.data.board_id || x.id === item.data.board_alias);
            return item;
        })

        const onlyInFilesJSON = c2.filter(function(item) {
            return !c1.find(x => (x.data.board_id === item.id || x.data.board_alias === item.id));
        })

        const allItems = hasMarkdownAndBoardImage.concat(onlyInFilesJSON);
        return allItems
    });



    return {
        dir: {
            input: "src",
            output: "_site",
        }
    }
}