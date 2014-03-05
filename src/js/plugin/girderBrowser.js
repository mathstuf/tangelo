/*jslint browser: true */

(function ($, d3, tangelo) {
    "use strict";

    if (!($ && d3)) {
        return;
    }

    function findItems(el, api, folderId) {
        var data,
            wait;

        wait = el.append("li")
            .append("a")
            .text("Loading items...");

        data = {
            folderId: folderId
        };

        d3.json(api + "/item?" + $.param(data), function (error, items) {
            if (error) {
                console.warn(error);
                tangelo.fatalError("girderBrowser", "could not retrieve items");
            }

            wait.remove();

            if (items.length > 0) {
                $.each(items, function (i, item) {
                    el.append("li")
                        .append("a")
                        .text(item.name + " (" + item.size + "B)");
                });
            }

        });
    }

    function findFolders(el, api, parentType, parentId) {
        var data;

        el.append("li")
            .append("a")
            .text("Loading folders...");

        data = {
            parentType: parentType,
            parentId: parentId
        };
        d3.json(api + "/folder?" + $.param(data), function (error, folders) {
            var elem;

            if (error) {
                console.warn(error);
                tangelo.fatalError("girderBrowser", "could not retrieve top-level users");
            }

            $(el.node()).empty();

            $.each(folders, function (i, f) {
                elem = el.append("li")
                    .classed("dropdown-submenu", true);

                elem.append("a")
                    .attr("href", "#")
                    .text(f.name);

                elem = elem.append("ul")
                    .classed("dropdown-menu", true);

                findFolders(elem, api, "folder", f._id);
                elem.append("li")
                    .classed("divider", true);
                findItems(elem, api, f._id);
            });
        });
    }

    $.fn.girderBrowser = function (cfg) {
        var me,
            menu,
            item,
            caret,
            label,
            api;

        // Extract cfg args.
        cfg = cfg || {};
        caret = cfg.caret === undefined ? "true" : cfg.caret;
        label = (cfg.label || "") + (caret ? "<b class=caret></b>" : "");
        api = cfg.api || "/girder/api/v1";

        // Empty the target element and make a d3 selection from it.
        $(this[0]).empty();
        me = d3.select(this[0]);

        // Class the target element as a dropdown.
        me.classed("dropdown", true);

        // Add an anchor tag with the label text.
        me.append("a")
            .attr("href", "#")
            .attr("role", "button")
            .classed("dropdown-toggle", true)
            .attr("data-toggle", "dropdown")
            .html(label);

        // Put down a placeholder "item".
        menu = me.append("ul")
            .classed("dropdown-menu", true);

        menu.append("li")
            .append("a")
            .text("Loading...");

        // Query the Girder API for the top level users and collections, and
        // display them in the top menu level.
        d3.json(api + "/user", function (error, users) {
            var i;

            if (error) {
                console.warn(error);
                tangelo.fatalError("girderBrowser", "could not retrieve top-level users");
            }

            $(menu.node()).empty();

            if (users.length > 0) {
                menu.append("li")
                    .html("<strong>Users</strong>");

                $.each(users, function (i, user) {
                    item = menu.append("li")
                        .classed("dropdown-submenu", true);

                    item.append("a")
                        .attr("href", "#")
                        .text([user.firstName, user.lastName].join(" "));

                    item = item.append("ul")
                        .classed("dropdown-menu", true);

                    findFolders(item, api, "user", user._id);
                });
            }

            d3.json(api + "/collection", function (error, collections) {
                if (error) {
                    console.warn(error);
                    tangelo.fatalError("girderBrowser", "could not retrieve top-level users");
                }

                if (collections.length > 0) {
                    menu.append("li")
                        .html("<strong>Collections</strong>");

                    $.each(collections, function (i, collection) {
                        item = menu.append("li")
                            .classed("dropdown-submenu", true);

                        item.append("a")
                            .attr("href", "#")
                            .text(collection.name);

                        item = item.append("ul")
                            .classed("dropdown-menu", true);

                        findFolders(item, api, "collection", collection._id);
                    });
                }
            });
        });

        // Make the element into a Bootstrap dropdown.
        $(me.select("a").node()).dropdown();
    };

}(window.jQuery, window.d3, window.tangelo));
