const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');

});

afterEach(async () => {
    await page.close();
})

test("We can launch a browser", async () => {
    
    // pupeteer is always async - there is a need for await
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});

test('clicking login start oauth flow', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch('/accounts\.google\.com/')
});

test('When signed in, show logout button', async () => {
    
    //custom function on page object
    await page.login();
    const logoutButton = await page.getContentsOf('a[href="/auth/logout"]');
    expect(logoutButton).toEqual('Logout');

});
