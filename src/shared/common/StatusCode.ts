export enum StatusCode {
  /** 成功 */
  C200 = '成功',
  /** 未知异常 */
  C500 = '未知异常',
  /** 未找到会话内容 */
  E10001 = '没有找到会话内容',
  /** 设置中没有配置token */
  E20001 = '请在设置中配置token',
  /** 调用失败场景 */
  E20002 = '调用失败，请检查网络或token',
  /** 无法创建session,可能无目录读写权限或空间不足 */
  E20003 = '无法创建session,可能无目录读写权限或空间不足',
  /** 无法操作,可能无目录读写权限或文件不存在 */
  E20004 = '无法操作,可能无目录读写权限或文件不存在',
  /** 不支持的session，请检查代码是否异常 */
  E20005 = '不支持的session，请检查代码是否异常',
  /** 加载异常,没有找到该session */
  E20006 = '加载异常,没有找到该session',
  /** 数据同步异常 */
  E20007 = '数据同步异常',
  /** 数据持久化异常，所有操作将无法保存 */
  E20008 = '数据持久化异常，所有操作将无法保存',
  /** 请等待生成完毕 */
  E20009 = '请等待生成完毕'
}
