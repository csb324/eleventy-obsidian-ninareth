import { App, Editor, EventRef, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MetaCSSSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MetaCSSSettings = {
	mySetting: 'default'
}

export default class MetaCSS extends Plugin {
	settings: MetaCSSSettings;
  private cmEditors: CodeMirror.Editor[];
	activeLeafChange: EventRef = undefined;
	mdView: MarkdownView = undefined;

	async onload() {
		await this.loadSettings();

    // this.cmEditors = [];
    // this.registerCodeMirror((cm) => {
    //   this.cmEditors.push(cm);
		// 	console.log(cm);
		// });

		

    // this.registerEvent(this.app.vault.on('modify', (event) => {
		// 	console.log(event);
    //   console.log('a changed file has stayed? in the arena')
    // }));

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerActiveLeafChangeEvent();
	}

  registerActiveLeafChangeEvent() {
		let md = 
    this.activeLeafChange = this.app.workspace.on(
      "active-leaf-change",
      async (event) => {
				console.log(event.view);

      }
    );
    this.registerEvent(this.activeLeafChange);
  }


	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class SampleSettingTab extends PluginSettingTab {
	plugin: MetaCSS;

	constructor(app: App, plugin: MetaCSS) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for MetaCSS'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
