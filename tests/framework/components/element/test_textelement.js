describe("pc.TextElement", function () {
    var app;
    var assets;
    var entity;
    var element;

    beforeEach(function (done) {
        app = new pc.Application(document.createElement("canvas"));
        buildElement(done);
    });

    var buildElement = function(callback) {
        entity = new pc.Entity("myEntity", app);
        element = app.systems.element.addComponent(entity, { type: pc.ELEMENTTYPE_TEXT });
        element.autoWidth = false;
        element.wrapLines = true;
        element.width = 200;


        var fontAsset = new pc.Asset("Arial", "font", {
            url: "base/examples/assets/Arial/Arial.json"
        });

        fontAsset.ready(function() {
            element.fontAsset = fontAsset;
            callback();
        }.bind(this));

        app.assets.add(fontAsset);
        app.assets.load(fontAsset);

        app.root.addChild(entity);

        assets = {
            font: fontAsset
        };
    };

    var assertLineContents = function(expectedLineContents) {
        expect(element.lines.length).to.equal(expectedLineContents.length);
        expect(element.lines).to.deep.equal(expectedLineContents);
    };

    afterEach(function () {
        app.destroy();
    });

    it("does not break onto multiple lines if the text is short enough", function () {
        element.text = "abcde fghij";
        assertLineContents(["abcde fghij"]);
    });

    it("does not break onto multiple lines if the autoWidth is set to true", function () {
        element.autoWidth = true;
        element.text = "abcde fghij klmno pqrst uvwxyz";
        assertLineContents(["abcde fghij klmno pqrst uvwxyz"]);
    });

    it("updates line wrapping once autoWidth becomes false and a width is set", function () {
        element.autoWidth = true;
        element.text = "abcde fghij klmno pqrst uvwxyz";
        expect(element.lines.length).to.equal(1);
        element.autoWidth = false;
        element.width = 200;
        expect(element.lines.length).to.equal(3);
    });

    it("does not break onto multiple lines if the wrapLines is set to false", function () {
        element.wrapLines = false;
        element.text = "abcde fghij klmno pqrst uvwxyz";
        assertLineContents(["abcde fghij klmno pqrst uvwxyz"]);
    });

    it("updates line wrapping once wrapLines becomes true", function () {
        element.wrapLines = false;
        element.text = "abcde fghij klmno pqrst uvwxyz";
        expect(element.lines.length).to.equal(1);
        element.wrapLines = true;
        expect(element.lines.length).to.equal(3);
    });

    it("breaks onto multiple lines if individual lines are too long", function () {
        element.text = "abcde fghij klmno pqrst uvwxyz";
        assertLineContents([
            "abcde fghij ",
            "klmno pqrst ",
            "uvwxyz"
        ]);
    });

    it("breaks individual words if they are too long to fit onto a line by themselves (single word case)", function () {
        element.text = "abcdefghijklmnopqrstuvwxyz";
        assertLineContents([
            "abcdefghijklm",
            "nopqrstuvwxy",
            "z"
        ]);
    });

    it("breaks individual words if they are too long to fit onto a line by themselves (multi word case)", function () {
        element.text = "abcdefgh ijklmnopqrstuvwxyz";
        assertLineContents([
            "abcdefgh ",
            "ijklmnopqrstu",
            "vwxyz"
        ]);
    });

    it("breaks individual characters onto separate lines if the width is really constrained", function () {
        element.width = 1;
        element.text = "abcdef ghijkl";
        assertLineContents([
            "a",
            "b",
            "c",
            "d",
            "e",
            "f ",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
        ]);
    });

    it("does not include whitespace at the end of a line in width calculations", function () {
        element.text = "abcdefgh        i";
        assertLineContents([
            "abcdefgh        ",
            "i"
        ]);
    });

    it("breaks words on hypens", function () {
        element.text = "abcde fghij-klm nopqr stuvwxyz";
        assertLineContents([
            "abcde fghij-",
            "klm nopqr ",
            "stuvwxyz"
        ]);
    });

    it("keeps hyphenated word segments together when wrapping them", function () {
        element.width = 150;
        element.text = "abcde fghij-klm nopqr stuvwxyz";
        assertLineContents([
            "abcde ",
            "fghij-klm ",
            "nopqr ",
            "stuvwxyz"
        ]);
    });

    it("splits lines on \\n", function () {
        element.text = "abcde\nfghij";
        assertLineContents([
            "abcde",
            "fghij"
        ]);
    });

    it("splits lines on \\r", function () {
        element.text = "abcde\rfghij";
        assertLineContents([
            "abcde",
            "fghij"
        ]);
    });

    it("splits lines on multiple \\n", function () {
        element.text = "abcde\n\n\nfg\nhij";
        assertLineContents([
            "abcde",
            "",
            "",
            "fg",
            "hij"
        ]);
    });

    it('AssetRegistry events unbound on destroy for font asset', function () {
        var e = new pc.Entity();

        e.addComponent('element', {
            type: 'text',
            fontAsset: 123456
        });

        expect(app.assets.hasEvent('add:123456')).to.be.true;

        e.destroy();

        expect(app.assets.hasEvent('add:123456')).to.be.false;
    });


    it('Font assets unbound when reset', function () {
        expect(!assets.font.hasEvent('add')).to.exist;
        expect(!assets.font.hasEvent('load')).to.exist;
        expect(!assets.font.hasEvent('remove')).to.exist;

        var e = new pc.Entity();
        e.addComponent('element', {
            type: 'text',
            fontAsset: assets.font
        });

        e.element.fontAsset = null;

        expect(!assets.font.hasEvent('add')).to.exist;
        expect(!assets.font.hasEvent('load')).to.exist;
        expect(!assets.font.hasEvent('remove')).to.exist;
    });

    it('Font assets unbound when destroy', function () {
        expect(!assets.font.hasEvent('add')).to.exist;
        expect(!assets.font.hasEvent('load')).to.exist;
        expect(!assets.font.hasEvent('remove')).to.exist;

        var e = new pc.Entity();
        e.addComponent('element', {
            type: 'text',
            fontAsset: assets.font
        });

        e.destroy();

        expect(!assets.font.hasEvent('add')).to.exist;
        expect(!assets.font.hasEvent('load')).to.exist;
        expect(!assets.font.hasEvent('remove')).to.exist;
    });
});

