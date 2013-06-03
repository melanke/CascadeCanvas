CascadeCanvas
=============

this is just a preview, a lot of features is already implemented
soon in english

```javascript

CC("#idDoElemento"); //seleciona um elemento pelo id

CC("Classe1 OutraClasse"); //seleciona elemento que contem Classe1 e OutraClasse

CC.new("#idDoElemento Classe1 Blabla"); //cria um elemento com id idDoElemento e que herda classes Classe1 e Blabla
CC.new("#idDoElemento Classe1 Blabla", opts); //passando parametros para os construtores das classes

CC("...").inherit("OutraClasse Classe1"); //faz com que os elementos selecionados herdem OutraClasse e Classe1

CC("...").merge({
  //mescla atributos publicos
});

CC("...").remove(); //remove o elemento

CC.clear(); //remove todos os elementos

CC("...").trigger("nomeDoEvento outroEvento"); //invoca os eventos para os elementos selecionados
CC("...").trigger("nomeDoEvento outroEvento.dominio"); //invoca os eventos para os elementos selecionados e no caso de outroEvento invoca apenas para o dominio especificado

CC("...").bind("nomeDoEvento outroEvento", function(){}); //declara função a ser invocada se
CC("...").bind("nomeDoEvento outroEvento.dominio", function(){}); //invoca os eventos para os elementos selecionados e no caso de outroEvento invoca apenas para o dominio especificado

CC("...").bind("nomeDoEvento outroEvento"); //invoca os eventos para os elementos selecionados
CC("...").unbind("nomeDoEvento outroEvento.dominio"); //invoca os eventos para os elementos selecionados e no caso de outroEvento invoca apenas para o dominio especificado

CC("...").each(function(){
	//invoca uma função para cada elemento selecionado que já foi criado
});

CC.def("Classe1 OutraClasse", function(opts){ 
	//define 2 classes iguais, opts são opções passadadas como parametro
	//diferente do foreach isso será invocado quando novos elementos forem criados
});

CC("...").search({
	//procura elementos que contenham todos os atributos
});

```
