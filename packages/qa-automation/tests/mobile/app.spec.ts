describe('Calvary Porn Blocker Mobile App', () => {
    it('should display the PIN lock screen', async () => {
        // Wait for the app to load
        await driver.pause(2000);

        // Find the PIN title text (using generic XPath or accessibility ID)
        const pinTitle = await $('~pin-lock-title');
        
        // Assert it exists
        const exists = await pinTitle.isExisting();
        expect(exists).toBe(true);
    });
});
