#!/bin/bash

# Скрипт для удаления image lists из Yandex Container Registry
# Image lists блокируют удаление обычных образов
# Использует таймауты и параллельное выполнение для ускорения

set -e

REGISTRY_ID="crps3tk5febf8afafgqi"
TIMEOUT=30  # Таймаут для каждой команды в секундах

# Все image lists из ошибки
IMAGE_LISTS=(
  "crp956gk67qmaaj4faji"
  "crpqpg25eddcd6homke1"
  "crpnraeheuq5vj9tvtrd"
  "crpgcljjg5id3vlbmn22"
  "crph95q56dkqv6pe684e"
  "crpc0puah15g948u6496"
  "crp3qnrcrfv2q6n3qj21"
  "crpc8b6ft6ne5jbjddj"
  "crpsunei9homk51cnj9u"
  "crpne1r9i1n2ic22tk8a"
  "crpt0nrglede3nrotuck"
  "crplvb3omh6j3pvd637c"
  "crpten6fa6428e195f9s"
  "crpoctje4bgfefosm3ki"
  "crp47ncrs41uu500mh80"
  "crpeucreu12c8lpiacm7"
  "crp1j9tea3mq01srub8d"
  "crp5te150bh0sisvtb8m"
  "crpb08o11vp94firjqol"
  "crpa14qeurgrdgknbbq4"
  "crpdjmg0i3jlgc49t697"
  "crpv38o0o7j14qd1mrti"
  "crpn0btijmfeh1djaquc"
  "crpvi4i5cuhen4o3hi7h"
  "crp5oec05s5l4rcbrmaq"
  "crpkl8pr0tt4764doi4n"
  "crpeupffpg52dput90mm"
  "crpbjqaculb20c468dak"
  "crpvu3o6180a4o2oa77d"
  "crplqeodgg5te6sm4dsd"
  "crpmojoomfuuvko9ead8"
  "crphfqbn95u4lb02p4p0"
  "crptc1hakatbufbquh4l"
  "crpaujr5vmugdkms55jl"
  "crpf5tqmvvcs1nrub8sb"
  "crpr43uh2kbu5eb3ka0b"
  "crpii1t1gr6b6t373fa7"
  "crpphjilthv2r8j9g0b3"
  "crpns0gdjh23blofo0tg"
  "crp4gi8tohneqnsatjoq"
  "crpmqmcqhoaobs12dk65"
  "crpvsjg7lcmv0jkii30s"
  "crp5p9q50dk2jbvee3r6"
  "crpko67cp1ro06mpbkuu"
  "crphe0i8se75ikuh964a"
  "crpgnb8kg81tsldku79r"
  "crpcjrf197uks0e1k74m"
  "crplkf0k3v09m8pina41"
  "crpp31n2sbk9d05olsic"
  "crp81k3im26r02kmkkc7"
  "crpnkqkjcdbma7ca587e"
  "crpffrv6n81bhcksao5i"
  "crp7t1ml1itlllh3l94k"
)

echo "🗑️  Удаление image lists из реестра $REGISTRY_ID..."
echo "Всего image lists: ${#IMAGE_LISTS[@]}"
echo "Используется таймаут: ${TIMEOUT}s на операцию"
echo ""

SUCCESS=0
FAILED=0
ALREADY_DELETED=0

delete_image_list() {
  local IMAGE_LIST_ID=$1
  local OUTPUT
  local PID
  
  # Запускаем команду в фоне и отслеживаем PID
  yc container image delete "$IMAGE_LIST_ID" > /tmp/yc_delete_$$.log 2>&1 &
  PID=$!
  
  # Ждем завершения с таймаутом
  local ELAPSED=0
  while kill -0 $PID 2>/dev/null && [ $ELAPSED -lt $TIMEOUT ]; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
  done
  
  # Если процесс еще работает - убиваем его
  if kill -0 $PID 2>/dev/null; then
    kill $PID 2>/dev/null
    wait $PID 2>/dev/null
    echo "⏱️  $IMAGE_LIST_ID (таймаут ${TIMEOUT}s)"
    rm -f /tmp/yc_delete_$$.log
    return 2
  fi
  
  # Читаем результат
  wait $PID
  OUTPUT=$(cat /tmp/yc_delete_$$.log 2>/dev/null || echo "")
  rm -f /tmp/yc_delete_$$.log
  
  if echo "$OUTPUT" | grep -qE "done|удален|deleted|operation.*queued|операция.*поставлена"; then
    echo "✅ $IMAGE_LIST_ID"
    return 0
  elif echo "$OUTPUT" | grep -qE "not found|не найден|does not exist|NotFound"; then
    echo "⚠️  $IMAGE_LIST_ID (уже удален)"
    return 1
  else
    echo "❌ $IMAGE_LIST_ID"
    echo "   $(echo "$OUTPUT" | head -1)"
    return 2
  fi
}

# Удаляем по одному с выводом прогресса
for i in "${!IMAGE_LISTS[@]}"; do
  IMAGE_LIST_ID="${IMAGE_LISTS[$i]}"
  printf "[%2d/%2d] " $((i+1)) ${#IMAGE_LISTS[@]}
  
  delete_image_list "$IMAGE_LIST_ID"
  RESULT=$?
  
  case $RESULT in
    0) ((SUCCESS++)) ;;
    1) ((ALREADY_DELETED++)) ;;
    2) ((FAILED++)) ;;
  esac
  
  # Небольшая задержка между запросами
  sleep 0.3
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Успешно удалено: $SUCCESS"
echo "⚠️  Уже были удалены: $ALREADY_DELETED"
echo "❌ Ошибки/таймауты: $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ $FAILED -eq 0 ]; then
  echo "🎉 Все image lists удалены! Теперь можно удалить обычные образы."
else
  echo "⚠️  Некоторые image lists не удалось удалить. Попробуйте удалить их через веб-интерфейс:"
  echo "   https://console.cloud.yandex.ru/folders/b1ggdi2brlp9vqlbg90a/container-registry/registry/crps3tk5febf8afafgqi"
fi
