import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
    };
    this.keyboardListener = this.keyboardListener.bind(this);
  }
  
  render() {
    return (
      <div className="view">
        <div className="currentTask">
          <h2>
            {this.getCurrentTask()}
          </h2>
        </div>
        <div className="newTask">
          <input ref="newTaskNameInput" type="text" className="newTaskName"
                 value={this.state.newTaskName}
                 onChange={evt => this.setState({newTaskName: evt.target.value})}/>
          <button onClick={evt => this.addNewTask()}> Add </button>
        </div>
      </div>
    );
  }

  advance() {
    // Only advance if we have any tasks.
    if (this.state.tasks.length !== 0) {
      let first = this.state.tasks[0];
      // Left rotate the array.
      let newTasks = this.state.tasks.slice(1).concat(first);
      this.setState({tasks: newTasks});
    }
  }

  keyboardListener(event) {
    // Ignore inputs if they're typing in the text box.
    // https://stackoverflow.com/a/30619329/5309823
    if (document.activeElement !== ReactDOM.findDOMNode(this.refs.newTaskNameInput)) {
      const SPACE = 32;
      switch(event.keyCode) {
        case SPACE:
          this.advance();
          break;
        // Nothing to do here.
        default:
          break;
      }
    }
  }

  addNewTask() {
    let newTasks = this.state.tasks;
    // Currently don't handle empty inputs.
    newTasks.push(this.state.newTaskName);
    // Clear out the name.
    this.state.newTaskName = '';
    this.setState({tasks: newTasks});
  }

  getCurrentTask() {
    if (this.state.tasks.length !== 0) {
      return this.state.tasks[0];
    } else {
      return "Add a task to get started.";
    }
  }

  // Found here: https://stackoverflow.com/a/46123962/5309823
  componentDidMount(){
    document.addEventListener("keydown", this.keyboardListener, false);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyboardListener, false);
  }
}

// ============================================================================
ReactDOM.render(<View />, document.getElementById('root'));
registerServiceWorker();
