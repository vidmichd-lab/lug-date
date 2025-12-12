#!/bin/bash

# Быстрая версия скрипта для удаления image lists
# Использует async флаг для ускорения

set -e

echo "🗑️  Быстрое удаление image lists..."
echo ""

# Все image lists из ошибки
IMAGE_LISTS=(
  "crp956gk67qmaaj4faji" "crpqpg25eddcd6homke1" "crpnraeheuq5vj9tvtrd"
  "crpgcljjg5id3vlbmn22" "crph95q56dkqv6pe684e" "crpc0puah15g948u6496"
  "crp3qnrcrfv2q6n3qj21" "crpc8b6ft6ne5jbjddj" "crpsunei9homk51cnj9u"
  "crpne1r9i1n2ic22tk8a" "crpt0nrglede3nrotuck" "crplvb3omh6j3pvd637c"
  "crpten6fa6428e195f9s" "crpoctje4bgfefosm3ki" "crp47ncrs41uu500mh80"
  "crpeucreu12c8lpiacm7" "crp1j9tea3mq01srub8d" "crp5te150bh0sisvtb8m"
  "crpb08o11vp94firjqol" "crpa14qeurgrdgknbbq4" "crpdjmg0i3jlgc49t697"
  "crpv38o0o7j14qd1mrti" "crpn0btijmfeh1djaquc" "crpvi4i5cuhen4o3hi7h"
  "crp5oec05s5l4rcbrmaq" "crpkl8pr0tt4764doi4n" "crpeupffpg52dput90mm"
  "crpbjqaculb20c468dak" "crpvu3o6180a4o2oa77d" "crplqeodgg5te6sm4dsd"
  "crpmojoomfuuvko9ead8" "crphfqbn95u4lb02p4p0" "crptc1hakatbufbquh4l"
  "crpaujr5vmugdkms55jl" "crpf5tqmvvcs1nrub8sb" "crpr43uh2kbu5eb3ka0b"
  "crpii1t1gr6b6t373fa7" "crpphjilthv2r8j9g0b3" "crpns0gdjh23blofo0tg"
  "crp4gi8tohneqnsatjoq" "crpmqmcqhoaobs12dk65" "crpvsjg7lcmv0jkii30s"
  "crp5p9q50dk2jbvee3r6" "crpko67cp1ro06mpbkuu" "crphe0i8se75ikuh964a"
  "crpgnb8kg81tsldku79r" "crpcjrf197uks0e1k74m" "crplkf0k3v09m8pina41"
  "crpp31n2sbk9d05olsic" "crp81k3im26r02kmkkc7" "crpnkqkjcdbma7ca587e"
  "crpffrv6n81bhcksao5i" "crp7t1ml1itlllh3l94k"
)

SUCCESS=0
FAILED=0
ALREADY_DELETED=0

for IMAGE_LIST_ID in "${IMAGE_LISTS[@]}"; do
  OUTPUT=$(yc container image delete "$IMAGE_LIST_ID" --async 2>&1)
  
  if echo "$OUTPUT" | grep -qE "done|operation.*queued|операция.*поставлена"; then
    echo "✅ $IMAGE_LIST_ID"
    ((SUCCESS++))
  elif echo "$OUTPUT" | grep -qE "not found|не найден|NotFound|does not exist"; then
    echo "⚠️  $IMAGE_LIST_ID (уже удален)"
    ((ALREADY_DELETED++))
  else
    ERROR_MSG=$(echo "$OUTPUT" | grep -iE "error|ошибка" | head -1)
    if [ -n "$ERROR_MSG" ]; then
      echo "❌ $IMAGE_LIST_ID: $ERROR_MSG"
    else
      echo "❌ $IMAGE_LIST_ID: $(echo "$OUTPUT" | head -1)"
    fi
    ((FAILED++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Успешно: $SUCCESS"
echo "⚠️  Уже удалены: $ALREADY_DELETED"
echo "❌ Ошибки: $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
