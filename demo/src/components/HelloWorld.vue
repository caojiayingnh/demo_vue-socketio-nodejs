<template>
  <div>
    <div class="title">Socket.io的Demo——匿名聊天室</div>
    <div class="dialog-box">
      <div class="subtitle">聊天</div>
      <el-tabs
        tab-position="left"
        type="card"
        class="dialog"
        @tab-click="autoChangeChannel"
        v-model="channel">
        <el-tab-pane
          v-for="channel in msgData"
          :key="channel.channelID"
          :label="channel.channel"
          :name="channel.channelID">
          <div class="msg-log" id="scroll">
            <div v-for="(msg,index) in channel.msg" :key="index" :class="msgStyle(msg.type)">
              <span class="sender">{{msg.sender}}</span>
              <span>&nbsp&nbsp</span>
              <span class="msg">{{msg.content}}</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div class="send-box">
        <el-input class="msg-input" v-model="myMsg" size="small"></el-input>
        <el-button class="msg-send" size="small" @click="sendMsg">发送</el-button>
      </div>
    </div>
    <div class="online-box">
      <div class="subtitle">当前在线用户</div>
      <div class="online">
        <div v-for="(user,index) in allUser" :key="index"><i class="el-icon-user"></i>{{user}}</div>
      </div>
    </div>
    <el-dialog
      title="请输入昵称"
      :visible.sync="dialogVisible"
      width="40%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-input v-model="username">
        <el-button slot="append" @click="confirmUsername">确定</el-button>
      </el-input>
    </el-dialog>
  </div>
</template>

<script>
  import SocketIo from 'socket.io-client'

  const socket = SocketIo('47.102.129.100:3000');

  export default {
    name: "dialogBox",
    data() {
      return {
        myMsg: '',
        channel: '1',
        username: '',
        id: '',
        dialogVisible: true,
        allUser: [],
        map: new Map(),
        //type:1系统 2别人 3自己
        msgData: [
          {
            channel: '世界聊天室',
            channelID: '1',
            msg: [
              {
                type: 1,
                sender: "系统",
                content: '[欢迎来到聊天室]'
              },
              {
                type: 2,
                sender: "测试",
                content: '测试^-^别人的话'
              }, {
                type: 2,
                sender: "多行测试",
                content: '测试^-^别人的话长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试'
              }, {
                type: 3,
                sender: "我",
                content: '测试自己的话'
              }, {
                type: 3,
                sender: "我",
                content: '测试自己的话'
              }, {
                type: 1,
                sender: "系统",
                content: '[可以开始对话了哟]'
              },
            ]
          }
        ],
      }
    },
    methods: {
      getUsers() {
        this.allUser = [];
        for (var value of this.map.values()) {
          this.allUser.push(value);
        }
      },
      autoChangeChannel(tag) {
        if (tag.name !== '0') {
          this.channel = tag.name
        }
      },
      msgStyle(type) {
        switch (type) {
          case 1:
            return "system";
          case 2:
            return "other";
          case 3:
            return "me";
          default:
            return
        }
      }, sendMsg() {
        if (this.myMsg === '') {
          this.$message.error('请输入信息');
          return;
        }
        socket.emit('chat', {sender: {id: this.id, name: this.username}, content: this.myMsg});
        this.myMsg = '';
      },
      confirmUsername() {
        if (this.username === '') {
          this.$message.error("请输入用户名")
        } else {
          this.dialogVisible = false;
          socket.on('getuser', data => {
            for (var key in data.map) {
              this.map.set(key, data.map[key]);
            }
            this.id = data.id;
            this.getUsers();
          });
          socket.on('someoneonline', data => {
            this.map.set(data.id, data.username);
            this.getUsers();
          });
          socket.on('someoneoffline', data => {
            this.map.delete(data.id);
            this.getUsers();
          });
          socket.on('chat', data => {
            console.log(data);
            let tempMsg = {
              type: 2,
              sender: data.sender.name,
              content: data.content
            };
            if (data.sender.id === this.id) {
              tempMsg.type = 3;
              tempMsg.sender = '我'
            }
            this.msgData[0].msg.push(tempMsg);
          });
          socket.emit('login', {username: this.username});
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .title {
    font-size: 24px;
    margin-bottom: 20px;
    color: #409EFF;
  }

  .subtitle {
    height: 7%;
    font-size: 20px;
    color: #409EFF;
  }

  .dialog-box {
    position: absolute;
    left: 5%;
    height: 70%;
    width: 60%;
  }

  .dialog {
    position: absolute;
    top: 7%;
    height: 86%;
    width: 100%;
    background: #efefef;

  }

  .msg-log {
    padding-top: 10px;
    padding-bottom: 3%;
    width: 100%;
    height: 97%;
    overflow-y: auto;
  }

  .system {
    text-align: center;
    width: 50%;
    position: relative;
    left: 25%;
    margin-top: 8px;
    color: coral;
  }

  .other {
    text-align: left;
    display: flex;
    flex-direction: row;
    margin-top: 8px;
  }

  .me {
    text-align: right;
    display: flex;
    flex-direction: row-reverse;
    margin-top: 8px;
  }

  .sender {
    border-radius: 8px;
    background: aliceblue;
    padding: 5px 10px;
  }

  .msg {
    text-align: left;
    border-radius: 3px;
    background: aliceblue;
    padding: 5px 10px;
    max-width: 70%;
    word-break: break-all;
  }

  .send-box {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 7%;
    width: 100%;
    background: #efefef;
  }

  .msg-input {
    width: 76%;
  }

  .msg-send {
    width: 22%;
  }

  .online-box {
    position: absolute;
    left: 70%;
    width: 25%;
    height: 70%;
  }

  .online {
    position: absolute;
    top: 7%;
    height: 93%;
    width: 100%;
    text-align: left;
    padding: 10px;
    background: #efefef;
  }

  >>> .el-tabs__header {
    background-color: #f6f6f6;
    width: 15% !important;
  }

  >>> .el-tabs__content {
    height: 100%;
  }

  >>> .el-tab-pane {
    height: 100%;
  }

</style>

