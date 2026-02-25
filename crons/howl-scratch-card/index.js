const RegionalTaskManager = new app.RegionalTaskManager();

RegionalTaskManager.registerTask("HowlScratchCard", 21, 0, async (account) => {
	const platform = app.HoyoLab.get(account.platform);
	const notes = await platform.notes(account);
	if (notes.success === false) {
		return;
	}

	const { data } = notes;
	const scratchCard = data.cardSign;
	if (scratchCard === "Completed") {
		return;
	}

	const webhook = app.Platform.get(3);
	const region = app.HoyoLab.getRegion(account.region);
	if (webhook) {
		const embed = {
			color: data.assets.color,
			title: "Howl's News Stand",
			author: {
				name: `${region} Server - ${account.nickname}`,
				icon_url: data.assets.logo
			},
			description: "You haven't scratched the card at Howl's News Stand yet!",
			thumbnail: {
				url: data.assets.logo
			},
			timestamp: new Date(),
			footer: {
				text: "Howl's News Stand",
				icon_url: data.assets.logo
			}
		};

		const userId = webhook.createUserMention(account.discord);
		await webhook.send(embed, {
			content: userId,
			author: data.assets.author,
			icon: data.assets.logo
		});
	}

	const telegram = app.Platform.get(2);
	if (telegram) {
		const messageText = [
			`📰 **Howl's News Stand** - Not scratched yet!`,
			`🆔 **UID**: ${account.uid} ${account.nickname}`,
			`🌍 **Region**: ${region}`
		].join("\n");

		telegram.sendBuffered(messageText, {
			bufferKey: `nap-${account.uid}`,
			gameLogo: data.assets.logo,
			gameName: data.assets.game
		});
	}
});

module.exports = {
	name: "howl-scratch-card",
	expression: "*/5 * * * *",
	description: "Reminds you if you haven't scratched the card at Howl's News Stand.",
	code: (async function howlScratchCard () {
		await RegionalTaskManager.executeTasks({ whitelist: "nap" });
	})
};
