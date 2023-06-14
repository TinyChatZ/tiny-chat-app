# TinyChat

> TinyChat这是一个调用ChatGPT API的桌面应用，基于electron开发提供了最简单的聊天功能，他的定位更像是一个挂在桌面的聊天窗口，当有问题时可以通过这个窗口直接发起调用。同时支持api转发功能，通过某些方式可使国内无需快乐上网即可访问。
>
> 注意需要提供你的OpenAI key才可以发起调用，具体可以参考配置，所有的key均保存在本地

![你好Hello](https://img.jaken.top/image/你好.gif)

## 安装

> 提供了release包，包括linux、mac、win等一些常见的安装包。当然更建议通过编译的方式来构建这个应用。

## 技术清单

- [electron](https://www.electronjs.org/): 创建桌面客户端环境
- [electron-vite](https://cn-evite.netlify.app/): electron下的打包工具，作者人很不错，也感谢群里小伙伴的帮助
- [vue.js](https://cn.vuejs.org/): vue.js
- [highlight.js](https://highlightjs.org/): 代码端高亮样式
- [naive-ui](https://www.naiveui.com/zh-CN/): 一个尤大推荐过得UI，我也很喜欢他
- [tailwindcss](https://www.tailwindcss.cn/): 告别写CSS的苦恼
- [pinia](https://pinia.vuejs.org/): 一个很不错的状态管理工具，用于vue3
- [vue-router](https://router.vuejs.org/): 路由管理，多个窗口想要共用一个render也只能这样了
- [vue-markdown-render](https://www.npmjs.com/package/vue-markdown-render): 现在直接使用了markdown-it也就是他的上游
- [loadsh](https://lodash.com/docs/): chatgpt推荐给我的，用起来真香

## 编译

<!-- todo 未完成 -->

## 更新日志

### 2023-06-14

🎉1.0.2-release

- 时隔两个月，把之前的一些bug都填好了
- 支持深色主题切换（个人强烈darkMode使用者）
- 优化markdown代码渲染（看上去渲染html文档没有太多bug了）
- 完善配置界面，支持一些功能（字体、超出限制策略）

### 2023-04-25

🎉1.0.1-release

- 很久没更新了，这段时间在搞别的，今天把设置界面等进行了优化
- 主进程和渲染进程之间通信也进行了优化，后续准备完成issues中的问题

### 2023-04-10

- 做了一些结构上的优化，使用pinia减少代码的耦合度，统一管理几个主要功能的状态

### 2023-04-07

🎉第一个pre-release发布:

- 支持访问chatgpt 3.5模型，支持stream流式返回

:technologist: 框架清单:

- [electron](https://www.electronjs.org/)
- [electron-vite](https://cn-evite.netlify.app/)
- [vue.js](https://cn.vuejs.org/)
- [highlight.js](https://highlightjs.org/)
- [vue-markdown-render](https://www.npmjs.com/package/vue-markdown-render)
- [naive-ui](https://www.naiveui.com/zh-CN/)
- [tailwindcss](https://www.tailwindcss.cn/)

我将这个工具分享给了小伙伴，也收到了一些反馈，接下来我们会先把一些没有做好的地方修整完毕，然后继续开始添加新的功能。

### 2023-03-30

因为OpenAI对国内并不十分友好，至少我的快乐上网的法子经常会被Cloudflare拒绝访问，因此也就萌生了tiny-chat的想法。我希望有一个简单的工具，可以提供在桌面端稳定的访问gpt的方法，因此我打开了github看到有几个electron客户端，有些直接嵌套了网页进去让我有些无语。我关注到[NoFWL](https://github.com/lencx/nofwl)这是一个很不错的客户端有很高的社区关注度，也有不错的功能，但他是通过Tauri实现的，我的能力不精学不明白rust，所以最后我决定自己写一个客户端，我对这个客户端有以下的期待：

- 他应该是简单的，不但功能简洁，而且对于后端或者web前端都可以看的明白
- 强迫自己用ts去实现（来自一个后端的洁癖，虽然这多少有点坑）
- 通过openai提供的api，不需要快乐上网就可以在国内访问（用nginx转发实现）
- 这个客户端也许会借（chao）鉴（xi）NoFWL的一些功能，但是他依旧应该用简单的形式展现

最后开始的开始，我花了一周的时间写了一个能跑的客户端，只是最简单的界面与最简单的功能……
