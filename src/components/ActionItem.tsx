import React from 'react'
import { IAction, IPlayReply } from '../reducers/initialState'
import { ActionDescriptor } from 'photoshop/dist/types/photoshop'
import { action } from '../imports'

export interface IActionItemProps{
	action:IAction
	batchPlayDecorator:boolean
}

export interface IActionItemDispatch{
	addReply: (reply: IPlayReply,id:number) => void
	toggleExpand:(expand:boolean,id:number)=>void
}

type TActionItem = IActionItemProps & IActionItemDispatch

export default class ActionItem extends React.Component<TActionItem> {
	constructor(props: TActionItem) {
		super(props)
	}

	private async copyToClipboard(text:string) {
		await action.batchPlay([{
			_obj: "textToClipboard",
			textData: text
		}], {})
	}

	private copy=()=> {
		const text = this.decorateCode(this.props.action.descriptor);
		this.copyToClipboard(text);
	}

	private decorateCode=(desc: ActionDescriptor): string=>{
		const codeStr = JSON.stringify(desc, null, 3)

		if (this.props.batchPlayDecorator) {
			const result = "await PhotoshopAction.batchPlay([\n"+codeStr+"\n], {})";
			return result;			
		} else {
			return codeStr;
		}
	}

	private toggleExpandAction = () => {
		this.props.toggleExpand(!this.props.action.collapsed, this.props.action.id);
	}

	private play = async () => {
		const result = await action.batchPlay([this.props.action.descriptor], {});
		this.props.addReply({
			descriptors: result,
			time: Date.now()
		},this.props.action.id);
	}

	private renderReplies = () => {
		const action = this.props.action;
		
		if (action.playReplies.length) {
			return (
				<div className="replies">
					<div className="header">Replies:</div>
					<div className="code">{JSON.stringify(action.playReplies.map(reply=>reply.descriptors[0]), null, 3)}</div>
				</div>
			)
		}
		else {
			return null;
		}
	}

	public render() {
		const { action } = this.props;
		return (
			<React.Fragment>
				<div className="action" key={action.id}>
					<div className="header">
						<sp-button quiet variant="primary" onClick={this.toggleExpandAction} className="collapse">{action.collapsed ? "⮞" : "⮟"}{" " + action.title}</sp-button>
						<div className="spread"></div>
						<sp-button quiet variant="secondary" title="play" onClick={this.play}>Play</sp-button>
						<sp-button quiet variant="secondary" title="copy" onClick={this.copy}  >Copy</sp-button>
					</div>
					{
						action.collapsed ? null :
							<React.Fragment>
								<div className="code">
									{this.decorateCode(action.descriptor)}
								</div>
								{this.renderReplies()}
							</React.Fragment>
					}
				</div>
			</React.Fragment>
		)
	}
}
