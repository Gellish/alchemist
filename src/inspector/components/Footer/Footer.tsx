import React from "react";
import "./Footer.less";
import { ButtonMenu } from "../ButtonMenu/ButtonMenu";
import { TExportItems, TImportItems, IDescriptor } from "../../model/types";
import { IRootState } from "../../../shared/store";
import { Settings } from "../../classes/Settings";
import { GetInfo } from "../../classes/GetInfo";
import { filterNonExistent } from "../../classes/filterNonExistent";
import { Main } from "../../../shared/classes/Main";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const versions = require("uxp").versions;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IFooterProps{
	wholeState: IRootState
	viewItems: IDescriptor[]
	allItems:IDescriptor[]
	selectedItems:IDescriptor[]
}

export interface IFooterDispatch {
	onClear: () => void
	onClearView: (keep: boolean) => void
	setWholeState: (state: IRootState) => void
	importItems: (items: IDescriptor[], kind: TImportItems) => void
	onClearNonExistent:(items: IDescriptor[])=>void
}


export type TFooter = IFooterProps & IFooterDispatch
export type TFooterComponent = React.Component<TFooter>

interface IState{
	defaultOption: number
}

export class Footer extends React.Component<TFooter,IState> { 
	constructor(props: TFooter) {
		super(props);

		this.state = {
			defaultOption: 0,
		};
	}

	private exportState = () => {
		Settings.saveSettingsWithDialog(this.props.wholeState);
	}

	private exportItems = async (kind: TExportItems) => {		
		Settings.exportDescriptorItems(kind === "all" ? this.props.allItems : this.props.selectedItems);
	}


	private importState = async () => {
		const data = await Settings.importStateWithDialog();
		if(!data){return;}
		this.props.setWholeState(data);
	}
	
	private importItems = async (kind:TImportItems) => {
		const data = await Settings.importStateWithDialog();
		if(!data){return;}
		this.props.importItems(data,kind);
	}

	private onImportMenuClick = (value: React.ChangeEvent<HTMLSelectElement>) => {
		switch (value.target.value) {
			case "appState": this.importState();
				break;
			case "addItems": this.importItems("append");
				break;
			case "replaceItems": this.importItems("replace");
				break;
		}
		this.setState({
			...this.state,
			defaultOption: this.state.defaultOption +1
		});
	}

	private onExportMenuClick = (value: React.ChangeEvent<HTMLSelectElement>) => {
		switch (value.target.value) {
			case "appState": this.exportState();
				break;
			case "allItems": this.exportItems("all");
				break;
			case "selectedItems": this.exportItems("selected");
				break;
		}
		this.setState({
			...this.state,
			defaultOption: this.state.defaultOption + 1
		});
	}

	private onClearMenuClick = (value: React.ChangeEvent<HTMLSelectElement>) => {
		const { onClear, onClearView, allItems, onClearNonExistent } = this.props;
		switch (value.target.value) {
			case "all": onClear();
				break;
			case "inView": onClearView(false);
				break;
			case "notInView": onClearView(true);
				break;
			case "nonExistent":onClearNonExistent(filterNonExistent(allItems));
				break;
		}
		this.setState({
			...this.state,
			defaultOption: this.state.defaultOption +1
		});
	}

	public render(): React.ReactNode{
		const psVersionSegments = GetInfo.getBuildString().split(" ");
		const psVersionString = psVersionSegments[0] + " " + psVersionSegments[1].replace("(","");
		return (
			<div className="Footer">
				<div className="wrap">
					<sp-dropdown class="drop" quiet="true" key={this.state.defaultOption}>
						<sp-menu slot="options" onMouseDown={(e: React.ChangeEvent<HTMLSelectElement>) => this.onClearMenuClick(e)}>
							<sp-menu-item value="default" style={{ display: "none" }} selected={this.state.defaultOption > -1 ? "default" : null}>Clear...</sp-menu-item>
							<sp-menu-item value="all">All</sp-menu-item>
							<sp-menu-item value="inView">In view</sp-menu-item>
							<sp-menu-item value="notInView">Not in view</sp-menu-item>
							<sp-menu-item value="nonExistent">Non-existent</sp-menu-item>
						</sp-menu>
					</sp-dropdown>
				</div>
				<div className="spread"></div>
				<div className="versionBar">
					<span className="version">v. {versions.plugin} {Main.devMode ? "DEV" : "PROD"}</span>
					<span> / </span>
					<span className="version">{versions.uxp}</span>
					<span> / PS: </span>
					<span className="version">{psVersionString}</span>
				</div>
				<div className="spread"></div>
				<div className="copy">Copyright © 2020 <a href="https://bereza.cz">Bereza.cz</a></div>
				<div className="spread"></div>
				<div className="wrap">
					<sp-dropdown class="drop" quiet="true" key={this.state.defaultOption}>
						<sp-menu slot="options" onMouseDown={(e: React.ChangeEvent<HTMLSelectElement>) => this.onImportMenuClick(e)}>
							<sp-menu-item value="default" style={{ display: "none" }} selected={this.state.defaultOption > -1 ? "default" : null}>Import...</sp-menu-item>
							<sp-menu-item value="appState">App state</sp-menu-item>
							<sp-menu-item value="addItems">Add items</sp-menu-item>
							<sp-menu-item value="replaceItems">Replace items</sp-menu-item>							
						</sp-menu>
					</sp-dropdown>
				</div>

				<div className="wrap">
					<sp-dropdown class="drop" quiet="true" key={this.state.defaultOption}>
						<sp-menu slot="options" onMouseDown={(e: React.ChangeEvent<HTMLSelectElement>) => this.onExportMenuClick(e)}>
							<sp-menu-item value="default" style={{ display: "none" }} selected={this.state.defaultOption > -1 ? "default" : null}>Export...</sp-menu-item>
							<sp-menu-item value="appState">App state</sp-menu-item>
							<sp-menu-item value="allItems">All items</sp-menu-item>
							<sp-menu-item value="selectedItems">Selected items</sp-menu-item>							
						</sp-menu>
					</sp-dropdown>
				</div>
			</div>
		);
	}
}