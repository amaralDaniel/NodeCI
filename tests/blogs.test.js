const Page = require("./helpers/page");

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto("http://localhost:3000");
});

afterEach(async () => {
    await page.close();
});

test("After login, click on the + red button and can see the blog creation form", async () => {
    await page.login();
    await page.click('a[href="/blogs/new"]');

    const label = await page.getContentsOf("form label");
    expect(label).toEqual("Blog Title");
});

describe("When logged in", async () => {
    beforeEach(async () => {
        await page.login();
        await page.click("a.btn-floating");
    });

    test("can see the blog creation form", async () => {
        const label = await page.getContentsOf("form label");
        expect(label).toEqual("Blog Title");
    });

    describe("And using valid input", async () => {
        beforeEach(async () => {
            await page.type(".title input", "My test title");
            await page.type(".content input", "My test content");
            await page.click("form button");
        });
        test("submit takes the user to the review screen", async () => {
            const confirmationMessage = await page.getContentsOf("h5");
            expect(confirmationMessage).toEqual("Please confirm your entries");
        });

        test("submit and saving adds the blog to the index page", async () => {
            await page.click("button.green");
            await page.waitFor(".card");

            const cardTitle = await page.getContentsOf(".card-title");
            const cardContent = await page.getContentsOf("p");

            expect(cardTitle).toEqual("My test title");
            expect(cardContent).toEqual("My test content");
        });
    });

    describe("And using invalid inputs", async () => {
        beforeEach(async () => {
            await page.click("form button");
        });
        test("the form shows an error message", async () => {
            const errorMessageTitle = await page.getContentsOf(
                ".title .red-text"
            );
            const errorMessageContent = await page.getContentsOf(
                ".content .red-text"
            );

            expect(errorMessageTitle).toEqual("You must provide a value");
            expect(errorMessageContent).toEqual("You must provide a value");
        });
    });
});

describe("When NOT logged in", async () => {
    const actions = [
        { 
            method: "get",
            path: "/api/blogs"
        },
        { 
            method: "post",
            path: "/api/blogs",
            data: { 
                title: "T",
                content: "C"
            }
        }
    ]
    test("User cannot create blog posts", async () => {
        const postResult = await page.post("/api/blogs", {
            title: "Automated Test title",
            content: "Automated Test content",
        });

        expect(postResult).toEqual({ error: "You must log in!" });
    });

    test("User cannot see blog posts", async () => {
        const getResult = await page.get("/api/blogs");

        expect(getResult).toEqual({ error: "You must log in!" });
    });
});
