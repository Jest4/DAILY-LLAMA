$(document).ready(function() {
  let answer = document.querySelector("#answer-template");
  let textbox = document.querySelector("#textbox-template");
  let mood = document.querySelector("#mood-template");
  let container = document.querySelector("#answer-container");
  let input_container = document.querySelector("#input-container");
  let prompts_list = [
    {
      title: "Your Entry",
      interface_name: "textarea"
    }
  ];
  let llama_entry = {
    answers: []
  };
  let current_prompt_handler;
  let current_prompt_index = 0;

  class Prompt_handler_text_lines {
    constructor(question_id) {

      this.question_id = question_id
      this.add_line();

      this.keypress_handler = (e) => {
        let keycode = (e.keyCode ? e.keyCode : e.which);
        let lines = $('.answer-input');
        if ((keycode === 13) && ($(lines[lines.length-1]).val() != "")) {
          this.add_line();
        }
      }
      $(document).on('keypress', this.keypress_handler);
    }

    //adds extra input line after a user hits 'enter' and focuses on the new line
    add_line() {
      let new_line = answer.content.cloneNode(true);
      input_container.appendChild(new_line);
      let lines = $('.answer-input');
      lines[lines.length-1].focus();
    }

    collect_answers() {

      let answers = [];

      let lines = $('.answer-input');
      for (let line of lines) {
        let answer_object = {};
        answer_object.question = this.question_id;
        answer_object.body = line.value;
        if (line.value.length > 0){
          answers.push(answer_object);
        }
      }
      return answers
    }

    cleanup() {
      $(document).off('keypress', this.keypress_handler);
      $("#input-container").empty();
    }
  };

  class Prompt_handler_textarea {
    constructor(question_id) {
      this.question_id = question_id
      let new_textbox = textbox.content.cloneNode(true);
      input_container.appendChild(new_textbox);
      $('.textbox-input').focus();
    }

    collect_answers() {
      let body = $('.textbox-input');
      return [{question: this.question_id, body: body.val()}]
    }

    cleanup() {
      $("#input-container").empty();
    }
  };

  class Prompt_handler_mood {
    constructor(question_id) {
      this.question_id = question_id
      input_container.appendChild(mood.content.cloneNode(true));
    }

    collect_answers() {
      let option = $('.mood-input');
      return [{question: this.question_id, body: option.val()}]
    }

    cleanup() {
      $("#input-container").empty();
    }
  };

  function load_prompt(index) {
    let prompt_info = prompts_list[index];
    // $('.question').html(prompt_info.title);
    $('.advice').html(prompt_info.subtitle);
    $('.advice').addClass('anim-typewriter')
    if (prompt_info.interface_name === "text_list") {
      current_prompt_handler = new Prompt_handler_text_lines(prompt_info.id)
    }
    if (prompt_info.interface_name === "textarea") {
      current_prompt_handler = new Prompt_handler_textarea(prompt_info.id)
    }
    if (prompt_info.interface_name === "mood") {
      current_prompt_handler = new Prompt_handler_mood(prompt_info.id)
    }
  }

  function finish_prompt() {
    if (current_prompt_index === 0) {
      let answers = current_prompt_handler.collect_answers();
      if (answers[0].body == "") {
        $(".mood-input").focus()
        return;
      };
    }
    if (current_prompt_index === 5) {
      let answers = current_prompt_handler.collect_answers();
      if (answers[0].body == "") {
        $(".textbox-input").prop("placeholder", `Oops. It looks like you left this empty... \n\nYou don't have to say much, but try and write down a few things you're currently thinking *right now*.`)
        return;
      };
    }
    llama_entry.answers = llama_entry.answers.concat(current_prompt_handler.collect_answers());
    current_prompt_handler.cleanup();
    current_prompt_index ++;

    if (current_prompt_index < prompts_list.length) {
      $('.advice').removeClass('anim-typewriter')
      $('.container').animateCss('slideOutUpBig', function(e) {
        load_prompt(current_prompt_index);
        $('.container').animateCss('slideInUpBig');
      });
    }
    // USE LINE BELOW FOR PRODUCTION
    // if (current_prompt_index === prompts_list.length) {
    if (current_prompt_index >= prompts_list.length) {
      console.log(llama_entry);
      $.post('/entries.json', llama_entry);
    }
  }

  function changeBackground() {
    let options = ['penguins', 'butterfly', 'doggo'];
    let newPhoto = options[Math.floor(Math.random() * options.length)];
    let fullScreen = $('.full-screen');
    fullScreen.removeClass(fullScreen.data('photo')).addClass(newPhoto).data('photo', newPhoto);
  }

  $('.container').animateCss('fadeInDown', function(e) {
    // opacity has to be set to 0 in HTML for the illusion to work
    $('.container').css('opacity', '1');
  });

  load_prompt(current_prompt_index);

  $('.submit-button').click(finish_prompt);

  let slideshow = setInterval(changeBackground, 30000);

//convenience function: generates valid ajax submissions (instead of the previous >= from today's line 157)
  $('.test-stable').click(function(e){
    e.preventDefault();
    $.post('/entries.json', {answers: [{body: "sad", question: 1}, {body: "code", question: 2},{body: "monkey", question: 3},{body: "enginering", question: 4},{body: "enginery", question: 5},{body: "I have so much work to get through, I don't know how I'm gonna even. This is a crazy payload. I don't think this is a good idea. Anxious thoughts. ERMAGAWD", question: 6}]});
  });
  $('.test-dissonant').click(function(e){
    e.preventDefault();
    $.post('/entries.json', {answers: [{body: "happy", question: 1}, {body: "code", question: 2},{body: "monkey", question: 3},{body: "enginering", question: 4},{body: "enginery", question: 5},{body: "I have so much work to get through, I don't know how I'm gonna even. This is a crazy payload. I don't think this is a good idea. Anxious thoughts. ERMAGAWD", question: 6}]});
  });
// function onSubmit( form ){
//   var data = JSON.stringify( $(form).serializeArray() ); //  <-----------

//   console.log( data );
//   return false; //don't submit
// }

});

$.fn.extend({
  animateCss: function(animationName, callback) {
    let animationEnd = (function(el) {
      let animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };
      for (let t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));
    this.addClass('animated ' + animationName).one(animationEnd, function() {
      $(this).removeClass('animated ' + animationName);
      if (typeof callback === 'function') callback();
    });
    return this;
  },
});