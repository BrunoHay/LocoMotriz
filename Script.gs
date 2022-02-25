const mode = 'default'; //'tests' ou 'default'

//Coordenadas Dados
var HEADLINE_LIN = 2;
var NOME_COL = 0;
var STATUS_COL= 1;
var PERM_COL = 2;
var ID_COL = 3;
var IDENT_COL = 4;
var PTS_COL = 5;
var SENT_COL = 6;
var DAILY_COL = 7;
var PRIVATELOG_COL = 8;
var MaxPointsPerDay_COORD = 'M3';
var Password_COORD = 'N3';
var LAST_COL = 11;
var GIFTS_COL = 10;

//Coordenadas Premios
var GCODE_COL = 0;
var GNAME_COL = 1;
var GQNT_COL = 3;
var GPRICE_COL = 4;
var GBOUGTH_COL = 5;

//Coordenadas Log
var LOG_COORD = 'A2';

//Páginas
var Dados = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dados');
var Premios = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Prêmios');
var LogPage = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');

//Canais
var app_rh = "hook_url";
var hayashi = "hook_url";
var rh2021 = "hook_url";
var lar_BOT = "hook_url";
var CanalApp = lar_BOT;
var CanalPremios = lar_BOT;

//sites
var siteCompleto = "site_url";
var siteDashboard = "site_url";
//Ações do comando
var actions = {
  'check': {
    'requiredArgsCount': 1,  //<name.surname>
    //Texto de ajuda em caso de comandos errados
    'helpText': [{ 'text': 'Digite `/rhbot check <nome.sobrenome>` para conferir os pontos de alguém' + '\n' + 'Digite `/rhbot check myself` para conferir seus pontos' + '\n' + 'Ou visite ' + "<"+siteCompleto+"|nosso Dashboard!>" }],
    'args': {
      //<nome.sobrenome> ou "myself"
      0: [/(\.|myself)/, 'Oops. Target inválido']
    },
    'execute': getUserStatus
  },
  'help': {
    'requiredArgsCount': 0,  //
    //Texto de ajuda em caso de comandos errados
    'helpText': [{ 'text': 'Digite `/rhbot check` para conferir pontos' + "\n" + ' `/rhbot send` para enviar pontos' + "\n" + ' `/rhbot add` para se cadastrar no sistema!'+ "\n" + ' `/rhbot buy` para retirar prêmios!'+ '\n' + 'ou visite ' + "<"+siteCompleto+"|nosso Dashboard!>"}],
    'args': {
      //Texto caso o texto não seja um email válido
      0: [/\w/, 'Oops. Erro desconhecido 1.']
    },
    'execute' : ajudar
  },
  'send': {
    'requiredArgsCount': 3, //<user> <points> <reason>
    //Texto de ajuda em caso de comandos errados
    'helpText': [{ 'text': 'Digite `/rhbot send <nome.sobrenome> <pontos> <justificativa>` para enviar pontos' }],
    'args': {
      //Texto caso o texto não seja um email válido
      0: [/\./, 'Oops. Target inválido'], //tem q ter pelo menos 1 ponto
      1: [/^\d+$/, 'Oops. Quantidade de pontos inválida!'], //tem q ter apenas numeros
      2: [/\w/, 'Oops. Justificativa inválida']  
    },
    'execute': setNewValue
  },
  'add': {
    'requiredArgsCount': 3, //<name.surname> <nickname> <password>
    //Texto de ajuda em caso de comandos errados
    'helpText': [{ 'text': 'Digite `/rhbot add <nome.sobrenome> <nickname> <senha>` para se adicionar ao programa' }],
    'args': {
      0: [/\./, 'Oops. Indicador inválido'], //tem q ter pelo menos 1 ponto
      1: [/^[A-Za-z]+$/, 'Oops. Nickname inválido. Não aceitamos número'],//não pode ter número
      2: [/\w/, 'Oops. Senha incorreta']
    },
    'execute': addUser
  },
  'mod': {
    'requiredArgsCount': 2, //<command> <args>
    //Texto de ajuda em caso de comandos errados
    'helpText': [{ 'text': 'Digite `/rhbot mod <modCommand> <args>` para alterar o programa' }],
    'args': {
      0: [/\w/, 'Oops. Indicador inválido'],
      1: [/\w/, 'Oops. Nickname inválido']
    },
    'execute': modMode
  },
  'dev': {
    'requiredArgsCount': 2, //<command> <args>
    //Texto de ajuda em caso de comandos errados
    'helpText': [{ 'text': 'Digite `/rhbot dev <devCommand> <args>` para alterar o programa' }],
    'args': {
      0: [/\w/, 'Oops. Indicador inválido'],
      1: [/\w/, 'Oops. Nickname inválido']
    },
    'execute': devMode
  },
  'buy': {
    'requiredArgsCount': 2, //<itemCode> <quantity>
    //Texto de ajuda em caso de comandos errados
    'helpText': [{ 'text': 'Digite `/rhbot buy <código do ítem> <quantidade>` para adquirir o prêmio'+ '\n' + 'Confira os prêmios disponíveis no ' + "<"+siteDashboard+"|nosso Dashboard!>" }],
    'args': {
      0: [/^P\d{2}/, 'Oops. Código inválido'],
      1: [/^\d+$/, 'Oops. Quantidade inválida']
    },
    'execute': buyGift
  }
};

  function doPost(e){
  switch (mode) {
    case 'tests':
      e=null
      var req= {
          token: 'abcdefghijk',
          team_id: 'T0001',
          team_domain: 'example',
          enterprise_id: 'E0001',
          enterprise_name: 'New%Name',
          channel_id: 'C000001',
          channel_name: 'test',
          user_id: 'U0000000001',
          user_name: 'Hayashi',
          command: '/rhbot',
          text: 'dev+accessLinks+Hayashi', // ao invés de espaço, "+"
          response_url: 'Teste',
          trigger_id: 'Teste'
          }
        break
    default:
      var req = null;
      req = queryStringToJSON(e.postData.contents);
  }

  try {
    /* Extract the action from the request text */
    var action = getAction(req);
    //Texto se o comando for inválido
    if (!actionIsValid(action)) throw 'Vixe, comando errado';         //throw cancela funcao e pula para catch
    /* Extract the action arguments from the request text */
    var args = getActionArgs(req);
    args.forEach(function(arg, index) {
      if (!actionParamIsValid(arg, index, action)){
        throw actions[action].args[index][1];                     //index 1 é a mensagem de erro em args
      }
    });
    var userID=req['user_id'];
    /* The result of the handler for any action is assigned to resText */
    var resText = actions[action].execute(args,userID);
    /* The response is composed and sent here */
    var res = composeResponse(resText);
    if (action != "add" || action != "help"){
    //saveLog(req);
    }
    return quickResponse(res);
  } catch (error) {
    //Logger.log("New Error: " + error + ' from ' + e.postData.contents);
    if (!req || !req['text']) {
      //Texto se não houver texto, só comando
      return quickResponse(composeResponse('Olá! Me chamou?', actions.help.helpText));
    }
    var errorMessage = composeResponse(error, actions[action].helpText);
    return quickResponse(errorMessage);
  }
}
function ajudar(args,userID) {
  throw 'Olá, aqui está uma lista de comandos disponíveis!';
}

function saveLog(req){
  //var currentLog = LogPage.getRange(LOG_COORD).getValue();
  //var text = currentLog + "\n" + Utilities.formatDate(new Date(), "GMT-3", "dd/MM|HH:mm") + "[" + translate(req['user_id']) + "][" + req['text'] + "]";
  //LogPage.getRange(LOG_COORD).setValue(text);
  LogPage.appendRow([Utilities.formatDate(new Date(), "GMT-3", "dd/MM|HH:mm"),translate(req['user_id']),req['text']]);
return
}

function translate(element){
  if (element.includes('.')){ //se for identificador de usuário
    var name = findValueInSheet(element, IDENT_COL, NOME_COL, Dados);
  } else if (RegExp("^p", "i").test(element)){ //se for codigo de premio
    var name = findValueInSheet(element, GCODE_COL, GNAME_COL, Premios);
  } else { //se for ID de usuário
    var name = findValueInSheet(element, ID_COL, NOME_COL, Dados);
  }
  return name
}

function getAction(req) {
  var payload = req['text'];
  var action = payload.split('+')[0];     
  return action
}

function actionIsValid(action) {
  var actionList = Object.keys(actions);
  if (actionList.indexOf(action) > -1) return true;
  return false;
}

function getActionArgs(req) {
  var payload = req['text'];
  
  var payloadObjects = payload.split('+');  
  
  var action = payloadObjects[0];
  var argCount = actions[action].requiredArgsCount;
  if (payloadObjects.length-1< parseInt(argCount)) {
    //Texto se o comando estiver incompleto
    throw 'Oops. Comando incompleto. Aqui estão as opções do comando '+action+':';
  }
  //var args = payloadObjects[1].split('+', argCount);  
  //var args = payloadObjects.slice(1,argCount+1);
  var args = payloadObjects.slice(1,argCount);
  args[argCount-1] = payloadObjects.slice(argCount).join(' ');

  switch(mode){
    case 'tests':
      Logger.log('payload=' + payload);
      Logger.log('payloadObjects= '+ payloadObjects);
      Logger.log('payloadObjects size= '+ payloadObjects.length);
      Logger.log('argCount = '+ argCount);
      Logger.log('action=' + action);
      Logger.log('args= '+ args);
    default:
      return args;
  }
}

function actionParamIsValid(param, paramIndex, action) {
  var pattern = actions[action].args[paramIndex][0];
  return pattern.test(param);      //testa se em param tem match com pattern
}

function composeResponse(text, attachments) {
  var res = {
    "response_type": "ephemeral",
    "text": text,
    "attachments": attachments || []
  };
  return res;
}

//Encontra o valor na planilha e o retorna
function findValueInSheet(key, keyColumn, valueColumn, _sheet) {
  var sheet = _sheet;
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var selectedRow = null;
  for (var i = 0; i < values.length; i++)
  {
    if (values[i][keyColumn] === key)
    {
      selectedRow = i;
      break;
    }
  }
  if (!selectedRow) throw 'Ué. Não encontramos o identificador digitado.';
  return values[selectedRow][valueColumn];
}

function devMode(args,userID){
  var userPermission = findValueInSheet(userID, ID_COL, PERM_COL, Dados);
  if (userPermission == 'dev'){
    var devCommand = args[0];
    if (devCommand == 'denominate'){
      // dev denominate <name.surname>
      var target = args[1];
      var position = findPositionInSheet(target, IDENT_COL, PERM_COL, Dados);
      Dados.getRange(position[0]+1,position[1]+1).setValue('user');
      return 'Você acabou de retirar as permissões de: '+ translate(target);
    } else if (devCommand == 'changeValue'){
      //dev changeValue <name.surname> <newValue>
      var newArgs = args[1].split(' '); //[name.surname, newValue]
      var position = findPositionInSheet(newArgs[0], IDENT_COL, PTS_COL, Dados);
      var oldValue = Dados.getRange(position[0]+1,position[1]+1).getValue();
      Dados.getRange(position[0]+1,position[1]+1).setValue(newArgs[1]);
      return 'Você acabou de mudar a pontuação do usuário: ' + translate(newArgs[0]) + ' de ' + oldValue.toString() + ' para ' + newArgs[1].toString() ;
    } else if (devCommand == 'accessLinks'){
      // dev accessLinks Hayashi
      return "<site_url|Planiha de controle>" + "\n" + "<site_url|Dashboard>" + "\n" + "<site_url|Código do site>"+"\n" + "O código fonte se encontra na planilha de controle";

    }else {
      throw 'Comando Inválido';
    }
  } else{
    throw 'Você não tem as permissões necessárias!';
  }
}

function modMode(args,userID){
  var userPermission = findValueInSheet(userID, ID_COL, PERM_COL, Dados);
  if (userPermission == 'mod' || userPermission =='dev'){
    var modCommand = args[0];
    if (modCommand == 'deactivate'){
      //mod deactivate <name.surname>
      var target = args[1];
      var position = findPositionInSheet(target, IDENT_COL, STATUS_COL, Dados);
      Dados.getRange(position[0]+1,position[1]+1).setValue('Desativado');
      return 'Você acabou de desativar o usuário "' + translate(target) + '"';
    } else if (modCommand == 'nominate'){
      //mod nominate <name.surname>
      var target = args[1];
      var position = findPositionInSheet(target, IDENT_COL, STATUS_COL, Dados);
      Dados.getRange(position[0]+1,position[1]+1).setValue('mod');
      return 'Você nomeou o usuário "' + translate(target) + '" ao cargo de moderador!'
    } else if (modCommand == 'setNewMaxPerDay'){
      //mod setNewMaxPerDay <value>
      var newMax = args[1];
      Dados.getRange(MaxPointsPerDay_COORD).setValue(newMax);
      return 'Você alterou o máximo de pontos por dia para: ' + newMax.toString() + ' pontos!'; 
    } else if (modCommand == 'givePoints'){
      //mod givePoints <name.surname> <points> <reason>
      var newArgs = args[1].split(' '); //[name.surname, points, reason]
      newArgs[2] = newArgs.slice(2).join(' ');
      if (translate(newArgs[0]) == translate(userID)) {
        return 'Te peguei! Você não pode enviar pontos para você mesmo!';
      } else {
        var position = findPositionInSheet(newArgs[0], IDENT_COL, PTS_COL, Dados);
        var oldValue = Dados.getRange(position[0]+1,position[1]+1).getValue();
        Dados.getRange(position[0]+1,position[1]+1).setValue(parseInt(oldValue) + parseInt(newArgs[1]));
        if (newArgs[2]!= null) {
          var body = '"' + newArgs[2] + '"';
        } else var body = "";
        var title = ":open_mouth: " + translate(userID) + " enviou " + newArgs[1] + " pontos de moderador para " + translate(newArgs[0]) + " :open_mouth:";
        postAsUser(buildText(title,body),CanalApp);
        return 'Você enviou: ' + newArgs[1].toString() + ' pontos de moderador para '+ translate(newArgs[0]);
      }
    } else if (modCommand == 'setNewGift'){
      //mod setNewGift <gift.Name> <quantity> <price> <description>
      var newArgs = args[1].split(' ');
      var descricao = newArgs.slice(3).join(' ');
      var giftName = newArgs[0].split('.').join(' ');
      var newCode = parseInt(Premios.getRange(Premios.getLastRow(),GCODE_COL+1).getValue().replace('P',''))+1;
      newCode = newCode.toString();
      if (newCode.length < 2) newCode = "0" + newCode;
      newCode = 'P' + newCode;
      var newData = [newCode, giftName, descricao, newArgs[1], newArgs[2]];
      var newRow = Premios.getLastRow()+1;
      for (var i=0;i<5;i++){
        Premios.getRange(newRow,GCODE_COL+1+i).setValue(newData[i]);
      }
      return 'Novo prêmio adicionado com sucesso!';
    }else {
      throw 'Comando inválido!';
    }
  } else{
    throw 'Você não tem as permissões necessárias!';
  }
}

function buyGift(args,userID){
  var selectedGift = args[0];
  var quantity = args[1];
  var oldQuantity = findValueInSheet(selectedGift, GCODE_COL, GQNT_COL, Premios);
  var userPoints = findValueInSheet(userID, ID_COL, PTS_COL, Dados);
  var giftPrice = findValueInSheet(selectedGift, GCODE_COL, GPRICE_COL, Premios);
  var userPointsPosition = findPositionInSheet(userID, ID_COL, PTS_COL, Dados);
  var giftUnitiesPosition = findPositionInSheet(selectedGift, GCODE_COL, GQNT_COL, Premios);
  if (userPoints<giftPrice){
    return 'Você não tem pontos suficientes! Faltam: ' + [giftPrice-userPoints].toString() + ' pontos para liberar o prêmio.';
  } else if (quantity>oldQuantity){
    return 'Vish, não temos estoque suficiente deste prêmio! Temos mais ' + oldQuantity.toString() + 'unidades disponíveis';
  } else {
    Premios.getRange(giftUnitiesPosition[0]+1,giftUnitiesPosition[1]+1).setValue(oldQuantity - quantity);
    Premios.getRange(giftUnitiesPosition[0]+1,GBOUGTH_COL+1).setValue(Premios.getRange(giftUnitiesPosition[0]+1,GBOUGTH_COL+1).getValue() + ', ' + translate(userID));
    Dados.getRange(userPointsPosition[0]+1,userPointsPosition[1]+1).setValue(userPoints - giftPrice);
    Dados.getRange(userPointsPosition[0]+1,GIFTS_COL+1).setValue(Dados.getRange(userPointsPosition[0]+1,GIFTS_COL+1).getValue() + ', '+ translate(selectedGift));
    var title = ":money_mouth_face:" + translate(userID) + " acabou de trocar seus pontos por um(a) incrível " + translate(selectedGift) + "!! Que inveja!" ;
    var warning = translate(userID) + " comprou: " + quantity.toString() + " x " + translate(selectedGift);
    postAsUser(buildText(title," "),CanalApp);
    postAsUser(buildText(warning," "),CanalPremios);
    return 'Você comprou: '+ translate(selectedGift) + '!';
  }
}

function addUser(args,userID){
  if (args[2]==Dados.getRange(Password_COORD).getValue()) {
  var lastRow = Dados.getLastRow();
  var maxPointsPerDay = Dados.getRange(MaxPointsPerDay_COORD).getValue();
  var values = [args[1],'Ativo', 'user', userID, args[0], 0, 0,maxPointsPerDay,0 ]

  for (var i = 0; i<LAST_COL;i++) {
  Dados.getRange(lastRow+1,i+1).setValue(values[i]);
  }
  var title = ":rocket: " + args[1] + " acabou de entrar!";
  postAsUser(buildText(title," "),CanalApp);
  return 'Bem vindo! Usuário cadastrado com sucesso!';
  } else {
    throw 'Senha incorreta! Contate um moderador!';
  }
}

function getUserStatus(args,userID) {
  var targetUser = args[0];
  if (targetUser == 'myself') {
    var numberOnList = findValueInSheet(userID, ID_COL, PTS_COL, Dados);
    var dailyCountDown = parseInt(findValueInSheet(userID, ID_COL, DAILY_COL, Dados));
    if (!numberOnList) {
      return 'Hmmm, aparentemente você ainda não tem pontos... Caso isso seja um erro, contate o RH!';
    }
    return "Você tem:  " + numberOnList.toString() + " pontos!" + "\n" + "Você ainda pode enviar " +dailyCountDown+ " pontos para outras pessoas!";
  } else {
    var numberOnList = findValueInSheet(targetUser, IDENT_COL, PTS_COL, Dados);
    if (!numberOnList) {
      return 'Hmmm, aparentemente ' + translate(targetUser) + ' ainda não tem pontos...';
    }
    return translate(targetUser) + " tem:  " + numberOnList.toString() + " pontos!";
  }
  
}

function findPositionInSheet(key, keyColumn, valueColumn, _sheet) {
  var sheet = _sheet;
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var selectedRow = null;

  for (var i = 0; i < values.length; i++)
  {
    if (values[i][keyColumn] === key)
    {
      selectedRow = i;
      break;
    }
  }
  if (!selectedRow) throw 'Ué. Não encontramos o identificador digitado na lista.';
  return [selectedRow,valueColumn];
}

function setNewValue(args,userID) {
  var userEmail = args[0];
  var newPoints = parseInt(args[1]);
  var numberOnList = findValueInSheet(userEmail, IDENT_COL, PTS_COL, Dados);
  var sentPoints = findValueInSheet(userID, ID_COL, SENT_COL, Dados);
  var dailyCountDown = parseInt(findValueInSheet(userID, ID_COL, DAILY_COL, Dados));
  var positionOnSheetTarget = findPositionInSheet(userEmail, IDENT_COL, PTS_COL, Dados);
  var positionOnSheetShooter = findPositionInSheet(userID, ID_COL, SENT_COL, Dados);
  if (translate(userEmail) == translate(userID)) {
    return 'Te peguei! Você não pode enviar pontos para si mesmo!';
  } else {
  if (newPoints > dailyCountDown) {
    throw 'Você não tem pontos suficientes para enviar hoje!'+ '\n' + 'Você tem: ' + dailyCountDown + ' pontos disponíveis para envio hoje!';
  }
  Dados.getRange(positionOnSheetTarget[0]+1,positionOnSheetTarget[1]+1).setValue(parseInt(numberOnList)+newPoints);
  Dados.getRange(positionOnSheetShooter[0]+1,positionOnSheetShooter[1]+1).setValue(parseInt(sentPoints)+newPoints);
  Dados.getRange(positionOnSheetShooter[0]+1,positionOnSheetShooter[1]+2).setValue(dailyCountDown-newPoints);
  if (args[2]!= null) {
    var body = '"' + args[2] + '"';
  } else var body = "";
  var title = ":moneybag: " + translate(userID) + " enviou " + args[1] + " pontos para " + translate(args[0]) + " :moneybag:";
  postAsUser(buildText(title,body),CanalApp);
  return "Você enviou  " + newPoints + " pontos!";
  }
}

function quickResponse(res) {
  var resString = JSON.stringify(res);
  var JSONOutput = ContentService.createTextOutput(resString);
  JSONOutput.setMimeType(ContentService.MimeType.JSON);
  switch(mode) {
    case 'tests':
    Logger.log(res);
    default:
    return JSONOutput;
  }
}

function queryStringToJSON (queryString) {
  if (!(queryString.indexOf('=') > -1)) return {};
  var queryStr = queryString.split('&');
  var queryJSON = {};
  queryStr.forEach(function(keyValue) {
    var keyValArr = keyValue.split('=');
    queryJSON[keyValArr[0]] = decodeURIComponent(keyValArr[1] || '');
  });
  return queryJSON;
}

function buildText(title,body) { 
  var payload = {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": title
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": body
        }
      }
    ]
  };
  return payload;
}

function postAsUser(payload, channel) {
  const webhook = channel; //Paste your webhook URL here
  var options = {
    "method": "post", 
    "contentType": "application/json", 
    "muteHttpExceptions": true, 
    "payload": JSON.stringify(payload) 
  };
  try {
    UrlFetchApp.fetch(webhook, options);
  } catch(e) {
    Logger.log(e);
  }
  return
}

function dailyAtt() {
  //Renova pontos
  var maxPointsPerDay = Dados.getRange(MaxPointsPerDay_COORD).getValue();
  var numberOfUsers = Dados.getLastRow()-HEADLINE_LIN;
  Dados.getRange(HEADLINE_LIN+1,DAILY_COL+1,numberOfUsers).setValue(maxPointsPerDay);
  //Salva log individual
  var points = Dados.getRange(HEADLINE_LIN+1,PTS_COL+1,numberOfUsers).getValues();
  var lastValues = Dados.getRange(HEADLINE_LIN+1,PRIVATELOG_COL+1,numberOfUsers).getValues();
  for (var i = 0;i<numberOfUsers;i++) {
  Dados.getRange(HEADLINE_LIN+1+i,PRIVATELOG_COL+1).setValue(lastValues[i].toString() + '#' + points[i].toString());
  }
}
