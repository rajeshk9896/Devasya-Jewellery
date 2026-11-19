# Devasya website with a product dashboard (for Vercel)

What is in this folder
- index.html          the shop (loads the product list)
- intro.mp4           your welcome video
- admin/index.html    the dashboard page (Decap CMS)
- admin/config.yml    dashboard settings  <-- you must edit ONE line in it
- api/auth.js         the dashboard login, step 1 (sends you to GitHub)
- api/callback.js     the dashboard login, step 2 (brings you back)
- content/products/   one file per product (the dashboard writes these)
- images/products/    your product photos go here (the dashboard uploads them)
- build.js            on every deploy: gathers the products and makes small web copies of the photos
- package.json        lists the one helper (sharp) that resizes the photos
- vercel.json         tells Vercel how to build the site

ONE-TIME SETUP (about 30 minutes)

1. GitHub
   - Put everything from this folder in your GitHub repository (keep the folders).
   - If you already have a repository from the earlier version, upload these files over it and delete netlify.toml if it is there.

2. Vercel project
   - vercel.com > Add New > Project > Import your GitHub repository.
   - Framework Preset: Other. Leave the build settings alone: vercel.json already sets them
     (Build Command: npm run build, Output Directory: public).
   - Press Deploy. The shop should open at your .vercel.app address.

3. GitHub login app (the dashboard uses this to let only you in)
   - GitHub > your profile picture > Settings > Developer settings > OAuth Apps > New OAuth App.
   - Application name: Devasya CMS
   - Homepage URL:  https://www.devasyajewellery.com
   - Authorization callback URL:  https://www.devasyajewellery.com/api/callback
   - Register it, then press "Generate a new client secret". Keep that page open.
   - If your domain is not pointing to Vercel yet, use your .vercel.app address in both lines above AND in base_url in admin/config.yml, and switch them later.

4. Give the login app to Vercel
   - Vercel > your project > Settings > Environment Variables. Add two:
       GITHUB_CLIENT_ID      = the Client ID from GitHub
       GITHUB_CLIENT_SECRET  = the client secret from GitHub
   - Then Deployments > the latest one > Redeploy. (New variables only work after a redeploy.)

5. Tell the dashboard where your repository is
   - In GitHub open admin/config.yml, press the pencil icon, and change
       repo: YOUR-GITHUB-USERNAME/YOUR-REPO-NAME
     to your real name, for example  repo: rajesh123/devasyajewellery
   - Commit. Vercel redeploys by itself.

6. Domain
   - Vercel > Settings > Domains > add www.devasyajewellery.com (and devasyajewellery.com).
   - Vercel shows the records to add in GoDaddy DNS. Use exactly the values it shows.

EVERY DAY: adding a product
1. Open https://www.devasyajewellery.com/admin/  and press Login with GitHub.
2. Products > New Product.
3. Fill in the name, collection and price. Upload the main photo (and more if you like). Add description and "Suitable for".
4. Press Publish (top right). Wait about a minute. The product is live.
To change a price, mark something sold out, or remove a product, open it in the same list.

PHOTO TIPS
- Use JPG, PNG or WebP (iPhone HEIC photos will not show; choose "Most Compatible" in the camera settings or share as JPG).
- Upright photos, about 4:5 shape, on a plain background look best.
- The build makes small copies for the website, but every upload is also stored in GitHub, so keep each photo under about 1.5 MB.

IF SOMETHING GOES WRONG
- "GITHUB_CLIENT_ID is not set": the variables are missing, or you have not redeployed after adding them.
- The login window closes with an error: check the callback URL in the GitHub app matches your domain exactly, and that base_url in admin/config.yml is the same domain.
- Nothing happens when you press Login: allow pop-ups for your site.
- "Not found" or no permission when publishing: the GitHub account you log in with must own the repository or be a collaborator.
