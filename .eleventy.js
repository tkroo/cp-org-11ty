/**
*  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
*/

const slugify = require('slugify');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const { Buffer } = require("node:buffer");
const minifyHtml = require("@minify-html/node");
const useMinifyHtml = false
const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(pluginRss);
    
    
    eleventyConfig.addPassthroughCopy({
        "src/_assets/images/favicon.ico": "favicon.ico",
        "src/_assets/css": "assets/css",
        "src/_assets/images": "assets/images",
        "src/_assets/javascript": "assets/javascript",
        "src/awesome-circuitpython": "awesome-circuitpython",
    });
    
    // don't process these templates
    eleventyConfig.ignores.add("src/awesome-circuitpython/contributing.md");
    eleventyConfig.ignores.add("src/awesome-circuitpython/CODE_OF_CONDUCT.md");
    eleventyConfig.ignores.add("src/awesome-circuitpython/cheatsheet/Circuitpython_Cheatsheet.md");
    

    eleventyConfig.addFilter("findme", function(arr, value) {
        return arr.find(x => x.id === value);
    })

    eleventyConfig.addFilter("relative_url", function(value) {
        return value
    })

    eleventyConfig.addFilter("dump", function(value) {
        return JSON.stringify(value)
    })

    eleventyConfig.addFilter("slugify", function(value) {
        return slugify(value, '_');
    })

    eleventyConfig.addFilter("formatDate", function(value) {
        const dateObj = value ? new Date(value+"") : new Date("1970-01-01");
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("yyyy-M-d");
    })

    eleventyConfig.addFilter("sortByDownloads", function(arr) {
        return arr.filter(x => x.info).sort((a, b) => {
            if (a?.info.downloads < b?.info.downloads) return 1;
            if (a?.info.downloads > b?.info.downloads) return -1;
            return 0;
        }).concat(arr.filter(x => !x.info))
    })

    eleventyConfig.addCollection("issueLabels", function(collectionApi) {
        const c1 = collectionApi.getAll()[0].data.libraries;
        const libs = Object.keys(c1.open_issues);
        const labels = [];
        const a = libs.forEach((x) => {
            c1.open_issues[x].forEach((y) => {
                labels.push(...y.labels);
            })
        })
        const output = [...new Set(labels)]
        return output
    });

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

        const hasMDAndImage = c1.filter(function(item) {
            return item.data.board_image != "unknown.jpg";
        });

        const addFileInfo = c1.map(item => {
            item.info = c2.find(x => x.id === item.data.board_id || x.id === item.data.board_alias);
            return item;
        })

        const onlyInFilesJSON = c2.filter(function(item) {
            return !c1.find(x => (x.data.board_id === item.id || x.data.board_alias === item.id));
        })

        const allItems = hasMDAndImage.concat(onlyInFilesJSON);
        return allItems
    });

    if (useMinifyHtml) {
        // TRANSFORM -- Minify HTML Output
        eleventyConfig.addTransform("minifyHtml", function (content, outputPath) {
          if (outputPath && outputPath.endsWith(".html")) {
            let minified = minifyHtml.minify(Buffer.from(content), {
              do_not_minify_doctype: true,
              keep_html_and_head_opening_tags: true,
              ensure_spec_compliant_unquoted_attribute_values: true,
              keep_spaces_between_attributes: true,
              keep_comments: false
            });
            return minified;
          }
          return content;
        });
      }

    return {
        dir: {
            input: "src",
            output: "_site",
        }
    }
}