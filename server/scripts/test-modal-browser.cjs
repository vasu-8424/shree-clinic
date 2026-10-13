async (page) => {
  console.log('🌐 Testing public website booking modal in browser...');

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 1. Click "Book Appointment" button on the navbar
  const bookBtn = page.getByRole('button', { name: 'Book Appointment' }).first();
  await bookBtn.click();
  await page.waitForSelector('h3:has-text("Book an Appointment")', { timeout: 5000 });

  // 2. Verify privacy text is visible under submit button
  const privacyText = page.locator('text=We use these details only to contact you about your appointment.');
  const hasPrivacyText = await privacyText.isVisible();

  // 3. Verify honeypot field exists
  const honeypot = page.locator('input[name="website_enquiry_hp"]');
  const hasHoneypot = (await honeypot.count()) > 0;

  // Intercept window.open
  await page.evaluate(() => {
    window.__lastOpenedUrl = null;
    window.open = (url) => {
      window.__lastOpenedUrl = url;
      return null;
    };
  });

  // 4. Fill form inside modal
  const modal = page.locator('.fixed.inset-0').filter({ hasText: 'Book an Appointment' });
  await modal.locator('input[placeholder*="Ramesh"]').fill('Ananya Sharma');
  await modal.locator('input[placeholder*="10-digit"]').fill('9988776655');
  await modal.getByRole('button', { name: /Speech Therapy/i }).first().click();
  await modal.locator('input[placeholder*="Knee pain"]').fill('Child speech clarity evaluation');

  // 5. Submit
  await modal.getByRole('button', { name: /Send Appointment Request via WhatsApp/i }).click();
  await page.waitForTimeout(2000);

  // 6. Verify confirmation screen
  const confirmationVisible = await page.locator('text=Appointment Request Sent!').isVisible();
  const openedUrl = await page.evaluate(() => window.__lastOpenedUrl);

  return {
    success: true,
    hasPrivacyText,
    hasHoneypot,
    confirmationVisible,
    openedWhatsAppUrl: openedUrl && openedUrl.includes('wa.me/917995478069'),
  };
}
