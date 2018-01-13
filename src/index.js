import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Cookie from 'js-cookie';
import DocumentTitle from 'react-document-title';

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
    <ol>
      {listItems}
    </ol>
  );
}

class Task extends React.Component {
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
    this.onKeyPress = this.onKeyPress.bind(this)
  }

  render() {
    let message;
    if (this.props.tasks.length > 0) {
      message = "Enter your routine and save it when you're done";
    } else {
      message = "To make a routine, type a task and then hit enter or the add button. Press save when you are done";
    }
    return (
      <div className="newTask">
        <p>
          {message}
        </p>
        <StringList strings = {this.props.tasks} />
        <input ref="newTaskNameInput" type="text" className="newTaskName"
               value={this.state.newTaskName}
               onChange={evt => this.setState({newTaskName: evt.target.value})}
               onKeyPress={this.onKeyPress}/>
        <button onClick={evt => {this.props.addTask(this.state.newTaskName); this.setState({newTaskName: ""})}}> Add </button>
        <button onClick={evt => this.props.save()}> Save </button>
      </div>

      )
  }
  onKeyPress(e) {
    if (e.key === "Enter")
    {
      this.props.addTask(this.state.newTaskName);
      this.setState({newTaskName: ""});

    }
  }
}

class RoutineViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index : 0
    }
    this.keyboardListener = this.keyboardListener.bind(this);
    this.getCurrentTask = this.getCurrentTask.bind(this);
  }
  render() {
    return (
      <div className="view">
        <Task name={this.getCurrentTask()}/>
        <button onClick={evt => this.props.deleteTasks()}> Delete Routine </button>
      </div>
    );
  }
  
  getCurrentTask() {
    if (this.props.tasks.length !== 0) {
      if (this.state.index >= this.props.tasks.length) {
        return "Done!"
      } else {
        return this.props.tasks[this.state.index];
      }
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
  keyboardListener(event) {
    // Ignore inputs if they're typing in the text box.
    // https://stackoverflow.com/a/30619329/5309823
    if (document.activeElement !== ReactDOM.findDOMNode(this.refs.newTaskNameInput)) {
      const SPACE = 32;
      switch(event.key) {
        case " ":
        case "Enter":
          this.advance();
          break;
        // Nothing to do here.
        default:
          console.log(event.key)
          break;
      }
    }
  }

  advance() {
    let index = this.state.index;
    this.setState({index: ++index});
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
      this.state.tasks = Cookie.getJSON('todo');
    }
    this.addNewTask = this.addNewTask.bind(this);
    this.save = this.save.bind(this);
    this.deleteTasks = this.deleteTasks.bind(this);
  }
  
  render() {
    if (this.state.premade)
      {
        return (
          <DocumentTitle title='Routine'>
            <RoutineViewer tasks={this.state.tasks} deleteTasks={this.deleteTasks}/>
          </DocumentTitle>
        );
      } else {
        return (
          <DocumentTitle title='Routine'>
            <RoutineMaker tasks={this.state.tasks} addTask={this.addNewTask} save={this.save}/>
          </DocumentTitle>
        );
      }
  }

  save() {
    Cookie.set('todo', this.state.tasks)
    this.setState({premade: true})
  }

  deleteTasks() {
    Cookie.remove('todo')
    this.setState({premade: false, tasks: []})
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
}

// ============================================================================
ReactDOM.render(<View />, document.getElementById('root'));
registerServiceWorker();
