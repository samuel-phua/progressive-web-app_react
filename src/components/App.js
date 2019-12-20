import React, { Component } from "react";
import { Route, withRouter } from "react-router-dom";
import LoginContainer from "./LoginContainer";
import ChatContainer from "./ChatContainer";
import UserContainer from "./UserContainer";
import "./app.css";

class App extends Component {
  state = { user: null, messages: [], messagesLoaded: false };

  handleSubmitMessage = (msg) => {
    const data = {
      msg,
      author: this.state.user.email,
      user_id: this.state.user.uid,
      timestamp: Date.now(),
    };
    // Send to database
    window.db.collection("messages").add(data);
  };

  onMessage = (snapshot) => {
    var messages = [];
    snapshot.forEach((doc) => {
      var msg = doc.data();
      msg.id = doc.id;
      messages.push(msg);
    });
    this.setState({ messages });
  };

  render() {
    return (
      <div id="container" className="inner-container">
        <Route path="/login" component={LoginContainer} />
        <Route exact path="/" render={() => (
          <ChatContainer
            onSubmit={this.handleSubmitMessage}
            user={this.state.user}
            messages={this.state.messages}
            messagesLoaded={this.state.messagesLoaded}
          />)} />
        <Route path="/users/:userId" render={({ history, match }) => (
          <UserContainer
            messages={this.state.messages}
            messagesLoaded={this.state.messagesLoaded}
            userId={match.params.userId}
          />)} />
      </div>
    );
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      } else {
        this.props.history.push("/login");
      }
    });
    window.db.collection("messages").orderBy("timestamp", "asc").onSnapshot((snapshot) => {
      this.onMessage(snapshot);
      if (!this.state.messagesLoaded) {
        this.setState({ messagesLoaded: true });
      }
    });
  }
}

export default withRouter(App);
