$('.skills-prog li').find('.skills-bar').each (i) ->
  $(this).find('.bar').delay(i*500).animate {
    width: $(this).parents().attr('data-percent') + '%'
  }, 2000, 'linear', ->
    $(this).css 'transition-duration': '.5s'
  return
$('.skills-soft li').find('svg').each (i) ->
  circle = $(this).children('.cbar')
  r = circle.attr('r')
  c = Math.PI * (r * 2)
  percent = $(this).parent().data 'percent'
  cbar = ((100-percent)/100) * c
  circle.css 'stroke-dashoffset': c, 'stroke-dasharray': c
  circle.delay(i*150).animate {
    strokeDashoffset: cbar
  }, 2000, 'linear', ->
    circle.css 'transition-duration': '.9s'
  $(this).siblings('small').prop('Counter', 0).delay(i*150).animate {
    Counter: percent
  }, duration: 1000, step: (now) ->
    $(this).text Math.ceil(now) + '%'
  return