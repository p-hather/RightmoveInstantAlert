# Rightmove Instant Alert

## Get instant alerts for Rightmove properties

Rightmove Instant Alert is a Node.js app written in Typescript that sends an (almost) instant alert to a Discord channel of your choice when a new property is detected that matches your custom search parameters.

### Why?

In some places, finding suitable properties is incredibly competitive. Rightmove's native email alert tool is far from instant - even when set at this level. Rightmove Instant Alert provides a much faster way to be notified of new property listings - therefore, a better chance of securing a viewing.

### Set up

Set up Rightmove Instant Alert by cloning this repo, ensuring you have all the prerequisites listed below, and setting your search parameters in `config.yaml`.

You can then run the app - and it will begin checking for new properties on a timer. NB the timer is currently set at 3 seconds - this will customisable in a future release.

### Prerequisites
* All npm packages installed
* A `.env` file created and stored in the root directory of this repo, with your `DISCORD_WEBHOOK`

### How does it work?

Rightmove Instant Alert works by constructing a Rightmove URL from the search parameters input in `config.yaml`. It checks for new properties by web scraping on a timer (currently set at every 3 seconds) and sends a listing link via Discord when a new property is detected.

### Disclaimer

Using a web scraping tool may be against Rightmove's terms of service. Therefore, this project is strictly educational and not intended to be used.
