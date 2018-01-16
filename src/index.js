import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Cookie from 'js-cookie';
import DocumentTitle from 'react-document-title';
import onClickOutside from "react-onclickoutside";
import ProgressBar from 'react-progressbar.js';

const EXPIRATION_LENGTH = 5000

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
    if (this.props.time === 0) {
      return (
        <div className="currentTask">
          <h2>
            {this.props.name}
          </h2>
        </div>
      )
    } else {
      return (
        <div className="currentTask">
          <h2>
            {this.props.name}
          </h2>
          <Timer time={this.props.time}/>
        </div>
      )
    }
    
  }
}

class Timer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      startTime: Date.now(),
      progress: 0
    };
  }
  render() {
    var options = {
      strokeWidth: 2
    };

    var containerStyle = {
        width: '200px',
        height: '200px'
    };
    let Circle = ProgressBar.Circle;
    return (
      <Circle
        progress={this.state.progress}
        text={'test'}
        options={options}
        initialAnimate={true}
        containerStyle={containerStyle}
        containerClassName={'.progressbar'} />
    );
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    let timeDeltaMs = Date.now() - this.state.startTime;
    let timeDeltaMin = timeDeltaMs/1000/60;
    let progress = timeDeltaMin / this.props.time;
    console.log(progress);
    this.setState({progress: progress});
  }
}

class TaskTextBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newTaskName : ""
    }
    this.onKeyPress = this.onKeyPress.bind(this)
  }

  onKeyPress(e) {
    if (e.key === "Enter")
    {
      this.props.addTask(this.state.newTaskName, this.props.timeName);
      this.setState({newTaskName: ""});

    }
  }

  render(){
    return (
      <input ref="newTaskNameInput" type="text" className="newTaskName"
        value={this.state.newTaskName}
        onChange={evt => this.setState({newTaskName: evt.target.value})}
        onKeyPress={this.onKeyPress}/>
    )
  }

}

class RoutineMaker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newTaskName : ""
    }
    this.addTask = this.addTask.bind(this)
  }

  addTask(taskName, timeName) {
    this.props.addTask(taskName, timeName);
  }

  render() {
    let message;
    if (this.props.morningTasks.length > 0) {
      message = "Enter your routine and save it when you're done";
    } else {
      message = "To make a routine, type a task and then hit enter or the add button. Press save when you are done";
    }
    return (
      <div className="newTask">
        <p>
          {message}
        </p>
        <h2>
          {"Morning Tasks"}
        </h2>
        <StringList strings = {this.props.morningTasks} />
        <TaskTextBox addTask={this.addTask} timeName={"morning"}/>
        <h2>
          {"Evening Tasks"}
        </h2>
        <StringList strings = {this.props.eveningTasks} />
        <TaskTextBox addTask={this.addTask} timeName={"evening"}/>
        <br/>
        <br/>
        <button onClick={evt => this.props.save()}> Save and Use </button>
        <button onClick={evt => this.props.removeTasks()}> Delete Routine </button>
      </div>

      )
  }
}


class RoutineViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index : 0
    }
    this.keyboardListener = this.keyboardListener.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.getCurrentTask = this.getCurrentTask.bind(this);
  }
  render() {
    return (
      <div className="view">
        <Task name={this.getCurrentTask()}/>
        <button onClick={evt => this.props.editTasks()}> Edit Routine </button>
      </div>
    );
  }
  
  getCurrentTask() {
    let taskList;
    let timeList;
    if (new Date().getHours() < 15) {
      taskList = this.props.morningTasks;
      timeList = this.props.morningTimes;
    } else {
      taskList = this.props.eveningTasks;
      timeList = this.props.eveningTimes;
    }
    if (taskList.length !== 0) {
      if (this.state.index >= taskList.length) {
        return "Done!"
      } else {
        return {"task": taskList[this.state.index], "time": timeList[this.state.index]};
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
      switch(event.key) {
        case " ":
        case "Enter":
        case "ArrowRight":
          this.advance();
          break;
        case "ArrowLeft":
          this.previous()
          break;
        default:
          break;
      }
    }
  }

  handleClickOutside() {
    this.advance();
    console.log("Click detected")
  }

  advance() {
    this.setState({index: this.state.index + 1});
  }

  previous() {
    if (this.state.index !== 0){
      this.setState({index: this.state.index - 1});
    }
  }
}

class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      morningTasks: [],
      eveningTasks: [],
      morningTimes: [],
      eveningTimes: [],
      premade: (typeof Cookie.getJSON('tasks') !== 'undefined')
    };
    if (this.state.premade) {
      let tasks = Cookie.getJSON('tasks');
      this.state.morningTasks = tasks['morningTasks'];
      this.state.eveningTasks = tasks['eveningTasks'];
      this.state.morningTimes = tasks['morningTimes'];
      this.state.eveningTimes = tasks['eveningTimes'];
      Cookie.set('tasks', tasks, {expires: EXPIRATION_LENGTH});
    }
    this.addNewTask = this.addNewTask.bind(this);
    this.save = this.save.bind(this);
    this.editTasks = this.editTasks.bind(this);
    this.deleteTasks = this.deleteTasks.bind(this);
  }
  
  render() {
    if (this.state.premade)
      {
        let ClickableViewer = onClickOutside(RoutineViewer);
        return (
          <DocumentTitle title='Routine'>
            <ClickableViewer morningTasks={this.state.morningTasks}
              eveningTasks={this.state.eveningTasks}
              editTasks={this.editTasks}/>
          </DocumentTitle>
        );
      } else {
        return (
          <DocumentTitle title='Routine'>
            <RoutineMaker morningTasks={this.state.morningTasks}
              eveningTasks={this.state.eveningTasks}
              addTask={this.addNewTask}
              save={this.save}
              removeTasks={this.deleteTasks}/>
          </DocumentTitle>
        );
      }
  }

  save() {
    let dict = {
      "morningTasks" : this.state.morningTasks,
      "eveningTasks" : this.state.eveningTasks,
      "morningTimes" : this.state.morningTimes,
      "eveningTimes" : this.state.eveningTasks
    }
    Cookie.set('tasks', dict, {expires: EXPIRATION_LENGTH})
    this.setState({premade: true})
  }

  editTasks() {
    this.setState({premade: false})
  }

  deleteTasks() {
    Cookie.remove('tasks');
    this.setState({
      morningTasks: [],
      eveningTasks: []
    })
  }

  addNewTask(taskName, timeName) {
    if (timeName === "morning")
    {
      let newTasks = this.state.morningTasks;
      newTasks.push(taskName);
      this.setState({morningTasks: newTasks});
    } else {
      let newTasks = this.state.eveningTasks;
      newTasks.push(taskName);
      this.setState({eveningTasks: newTasks});
    }
    
  };
}

// ============================================================================
ReactDOM.render(<View />, document.getElementById('root'));
registerServiceWorker();
