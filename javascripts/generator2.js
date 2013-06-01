document.observe('dom:loaded', function(){
  //trap return and enter -- must click directly on the Generate button
  Event.observe(window, 'keypress', function(evt){
    var code;
    if (!evt) var evt = window.event;
    if (evt.keyCode) code = evt.keyCode;
    else if (evt.which) code = evt.which;
    if(code && Event.KEY_RETURN == code){
      evt.stop();
      var firstFocusedElm = $$(':focus').first();
      if(firstFocusedElm && (!!firstFocusedElm.up('p').next('p').down('a'))){
        firstFocusedElm.up('p').next('p').down('a').click();
      }
    }
  });
  $('application').observe('blur', function(evt){
    this.setValue($F(this).toLowerCase().gsub(/\s+/, '-').underscore());
  });
  var m = new Template('<p class="field"><a class="remove_model" href="#">×</a><label for="models_#{id}">Model name</label> <input name="models[#{id}][name]" class="model" id="models_#{id}" value=""/></p> <p class="rule-below"><a href="#" class="btn add_relation">New Relation</a></p><p><a href="#" class="btn add_field">New Attribute</a></p><p><label><input type="hidden" name="models[#{id}][timestamps]" value="0" /><input type="checkbox" name="models[#{id}][timestamps]" value="1" checked="checked" />Timestamps</label></p>');
  var f = new Template('<a class="remove_field" href="#">×</a><input name="models[#{model}][attributes][#{id}][name]" placeholder="Attribute name" id="attribute_#{id}" class="field" value=""/> <select name="models[#{model}][attributes][#{id}][type]" id="type_#{id}"> <option value="boolean">Boolean</option> <option value="date">Date</option> <option value="datetime">DateTime</option> <option value="decimal">Decimal</option> <option value="float">Float</option> <option value="integer">Integer</option> <option value="string">String</option> <option value="text">Text</option> <option value="time">Time</option> </select> <label><input type="checkbox" class="validate" value="1" />Validate</label><span style="display:none"><label><input type="checkbox" name="models[#{model}][attributes][#{id}][validate_presence]" id="models_#{model}_validate_presence_#{id}" value="1" />Presence</label><label><input type="checkbox" class="validate_regexp" id="models_#{model}_validate_regexp_#{id}" value="1" />Regexp</label><input type="text" class="regexp" name="models[#{model}][attributes][#{id}][validate_regexp]" id="models_#{model}_regexp_#{id}" value="//" disabled="disabled" /><label><input type="checkbox" name="models[#{model}][attributes][#{id}][validate_email]" id="models_#{model}_validate_email_#{id}" value="1" />E-mail</label></span>');
  var r = new Template('<a class="remove_field" href="#">×</a><select name="models[#{model}][relationships][#{id}][type]" class="type" id="relationship_#{id}_type"> <option value="belongs_to">belongs_to</option> <option value="has_many">has_many</option> <option value="has_many_through">has_many_through</option> <option value="has_and_belongs_to_many">has_and_belongs_to_many</option> </select>');
  var mid = -1, aid = -1, rid = -1;
  var buildPicker = function(arrOptions, elName, elId, selected, elClass){
    if(undefined == selected) selected = arrOptions.first();
    if(undefined == elClass) elClass = 'references';
    var select = new Element('select', {name: elName, id: elId, 'class': elClass});
    arrOptions.each(function(elm){
      var opt = select.options.length;
      select.options[opt] = new Option(elm.classify(), elm);
      if(elm == selected) select.options.selectedIndex = opt;
    });
    return select;
  };
  document.on('click', 'input.validate', function(evt, elm){
    if(elm.checked){
      elm.up().next().show();
    }else{
      elm.up().next().hide().select('input[type="checkbox"]').each(function(el){ el.checked = false; });
      elm.up().next().down('.regexp').disable();
    }
  });
  document.on('click', 'input.validate_regexp', function(evt, elm){
    if(elm.checked){
      elm.up().next().enable().focus();
    }else{
      elm.up().next().disable();
    }
  });
  document.on('click', 'a.add_field', function(evt, elm){
    evt.stop();
    aid++;
    var mid = elm.up('fieldset').down('.model').mid;
    var p = new Element('p', {id: 'field_' + aid}).update(f.evaluate({'id': aid, 'model': mid}));
    elm.up('p').insert({before: p});
    p.down('input').focus();
  });
  document.on('click', 'a.add_relation', function(evt, elm){
    evt.stop();
    rid++;
    var mid = elm.up('fieldset').down('.model').mid;
    var p = new Element('p', {id: 'relation_' + rid}).update(r.evaluate({'id': rid, 'model': mid}));
    elm.up('p').insert({before: p});
    var model = elm.up('fieldset').down('input.model');
    var options = $$('input.model').reject(function(el){return el == model}).pluck('value').invoke('tableize').sort();
    var refs = p.down('select');
    var picker = buildPicker(options, 
      refs.name.sub('[type]','[references]'), 
      refs.id.sub('_type', '_references'),
      options.first(),
      'references'
    );
    p.down('select').insert({after: picker}).focus();
  });
  document.on('click', 'a.add_model', function(evt, elm){
    evt.stop();
    mid++;
    var f = new Element('fieldset').update(m.evaluate({'id': mid}));
    elm.up('p').insert({before: f});
    var model = f.down('input');
    model['mid'] = mid;
    document.fire('update:pickers');
    f.down('input').observe('blur', function(evt){
      var classname = $F(this).classify();
      this.setValue(classname);
      document.fire('update:pickers');
    }).focus();
  });
  document.on('click', 'a.remove_model', function(evt, elm){
    evt.stop();
    elm.up('fieldset').replace('');
    document.fire('update:pickers');
  });
  document.on('click', 'a.remove_field', function(evt, elm){
    evt.stop();
    elm.up('p').remove();
  });
  $('secure').observe('click', function(evt){
    if(this.checked && ! this.up('label').next('select')){
      var options = $$('input.model').pluck('value').select(function(e){ return e.length > 0; }).invoke('tableize').sort();
      var picker = buildPicker(options, 
        'user_model', 
        'user_model',
        options.first(),
        'references'
      );
      this.up('label').insert({after: picker});
    }
    document.fire('update:pickers');
  });
  document.observe('update:pickers', function(){
    var models = $$('input.model');
    $$('select').each(function(el){
      if(el.up('fieldset') && el.up('fieldset').down('input.model')){
        var model = el.up('fieldset').down('input.model');
        var options = models.reject(function(e){
          return e == model || !e.present();
        }).pluck('value').invoke('tableize').sort();
      }else{
        if( el.previous('label') && el.previous('label').down('[type="checkbox"]') ){
          if(! el.previous('label').down('[type="checkbox"]').checked){
            var picker = '';
          }else{
            var options = $$('input.model').pluck('value').select(function(e){ return e.length > 0; }).invoke('tableize').sort();
            var current = (el.getValue()) ? el.getValue() : options.first();
            var picker = buildPicker(options, 
              'user_model', 
              'user_model',
              current,
              'references'
            );
          }
          return el.replace(picker);
        }
      }
      if(options){
        var current = (el.getValue()) ? el.getValue() : options.first();
        var picker = buildPicker(options, el.name, el.id, current, el.className);
        if(el.hasClassName('references')) el.replace(picker);
        if(el.hasClassName('through') && el.previous('.references')){
          options = options.reject(function(e){
            return e == $F(el.previous('.references'));
          });
          picker = buildPicker(options, el.name, el.id, current, el.className);
          el.replace(picker);
        }
      }
    });
  });
  new Form.Observer('generator', 0.3, function(form, values){
    var valid = true;
    form.getElements().each(function(elm){
      if($F(elm) == ''){
        valid = false;
        elm.addClassName('field_with_errors');
      }else{
        elm.removeClassName('field_with_errors');
      }
      if(elm.match(':focus')) elm.removeClassName('field_with_errors');
    });
    (valid) ? $('commit').enable() : $('commit').disable();
  });
  document.on('click', 'input.field_with_errors', function(evt, elm){
    elm.removeClassName('field_with_errors');
  });
  document.on('change', 'select', function(evt, elm){
    if(['has_many','has_and_belongs_to_many','belongs_to','has_many_through'].include($F(elm))){
      var model = elm.up('fieldset').down('input.model');
      var options = $$('input.model').reject(function(el){
        return el == model
      }).pluck('value').invoke('tableize').sort();
      if(model.present()){
        var picker = buildPicker(options, 
          elm.name.sub('[type]', '[references]'), 
          elm.id.sub('_type', '_references'),
          options.first(),
          'references'
        );
        if(!elm.next('.references')) elm.insert({after: picker});
        if($F(elm) == 'has_many_through'){
          options = options.reject(function(e){
            return e == picker.getValue(); 
          });
          
          if(!picker.next('select')){
            var through = buildPicker(options, 
              picker.name.sub('[references]', '[through]'), 
              picker.id.sub('_references','_through'), 
              options.first(), 'through'
            );
            elm.up('p').insert(through);
          }
        }else{
          if(!!elm.next('select.through')) elm.next('select.through').replace('');
        }
      }
      if(elm.previous('input')){
        elm.previous('input').disable().
        setValue(picker.getValue().classify().foreign_key())
      };
    }else{
      if(!!elm.next('.references')){
        elm.next('.references').replace('');
        if(elm.previous('input')) elm.previous('input').enable().setValue('');
      }
    }
    if(elm.hasClassName('references') && elm.previous('input')){
      elm.previous('input').disable().
      setValue(elm.getValue().toString().classify().foreign_key());
    }
    document.fire('update:pickers');
  });
});
