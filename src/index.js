import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Cookie from 'js-cookie';

function ListItem(props) {
  return <li>{props.value}</li>;
}

function StringList(props) {
  const strings = props.strings;
  const listItems = strings.map((string, index) =>
    <ListItem key={index}
              value={string} />

  );
  return (
    <ul>
      {listItems}
    </ul>
  );
}

class Task extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="currentTask">
        <h2>
          {this.props.name}
        </h2>
      </div>  )
  }
}

class RoutineMaker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newTaskName : ""
    }
  }

  render() {
    return (
      <div className="newTask">
        <StringList strings = {this.props.tasks} />
        <input ref="newTaskNameInput" type="text" className="newTaskName"
               value={this.state.newTaskName}
               onChange={evt => this.setState({newTaskName: evt.target.value})}/>
        <button onClick={evt => this.props.addTask(this.state.newTaskName)}> Add </button>
        <button onClick={evt => this.props.save()}> Save </button>
      </div>

      )
  }
}

class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      premade: (typeof Cookie.getJSON('todo') !== 'undefined')
    };
    if (this.state.premade) { // TODO: Determine why we aren't loading saved state correctly
      this.setState({tasks: Cookie.getJSON('todo')})
    }
    this.keyboardListener = this.keyboardListener.bind(this);
    this.addNewTask = this.addNewTask.bind(this);
    this.save = this.save.bind(this);
    this.getCurrentTask = this.getCurrentTask.bind(this)
  }
  
  render() {
    if (this.state.premade)
      {
        return (
              <div className="view">
                <Task name={this.getCurrentTask()}/>
              </div>
            );
      }
    return (
      <RoutineMaker tasks={this.state.tasks} addTask={this.addNewTask} save={this.save}/>
    )
    
  }

  save() {
    Cookie.set('todo', this.state.tasks)
    console.log(this.state.tasks)
    this.setState({premade: true})
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

  addNewTask(taskName) {
    let newTasks = this.state.tasks;
    // Currently don't handle empty inputs.
    newTasks.push(taskName);
    // Clear out the name.
    // this.setState({
    //   newTaskName: ''
    this.setState({tasks: newTasks});
  };

  getCurrentTask() {
    console.log(this.state.tasks)
    console.log(this.state.premade)
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
