//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/customer_package_balance.dart';
import 'package:openapi/src/model/ledger_entry.dart';
import 'package:openapi/src/model/reservation_summary.dart';
import 'package:openapi/src/model/cursor_page_meta.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_ledger_result.g.dart';

/// PackageLedgerResult
///
/// Properties:
/// * [balance] 
/// * [reservations] 
/// * [entries] 
/// * [page] 
@BuiltValue()
abstract class PackageLedgerResult implements Built<PackageLedgerResult, PackageLedgerResultBuilder> {
  @BuiltValueField(wireName: r'balance')
  CustomerPackageBalance get balance;

  @BuiltValueField(wireName: r'reservations')
  ReservationSummary get reservations;

  @BuiltValueField(wireName: r'entries')
  BuiltList<LedgerEntry> get entries;

  @BuiltValueField(wireName: r'page')
  CursorPageMeta get page;

  PackageLedgerResult._();

  factory PackageLedgerResult([void updates(PackageLedgerResultBuilder b)]) = _$PackageLedgerResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackageLedgerResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackageLedgerResult> get serializer => _$PackageLedgerResultSerializer();
}

class _$PackageLedgerResultSerializer implements PrimitiveSerializer<PackageLedgerResult> {
  @override
  final Iterable<Type> types = const [PackageLedgerResult, _$PackageLedgerResult];

  @override
  final String wireName = r'PackageLedgerResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackageLedgerResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'balance';
    yield serializers.serialize(
      object.balance,
      specifiedType: const FullType(CustomerPackageBalance),
    );
    yield r'reservations';
    yield serializers.serialize(
      object.reservations,
      specifiedType: const FullType(ReservationSummary),
    );
    yield r'entries';
    yield serializers.serialize(
      object.entries,
      specifiedType: const FullType(BuiltList, [FullType(LedgerEntry)]),
    );
    yield r'page';
    yield serializers.serialize(
      object.page,
      specifiedType: const FullType(CursorPageMeta),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PackageLedgerResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackageLedgerResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'balance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerPackageBalance),
          ) as CustomerPackageBalance;
          result.balance.replace(valueDes);
          break;
        case r'reservations':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ReservationSummary),
          ) as ReservationSummary;
          result.reservations.replace(valueDes);
          break;
        case r'entries':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(LedgerEntry)]),
          ) as BuiltList<LedgerEntry>;
          result.entries.replace(valueDes);
          break;
        case r'page':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CursorPageMeta),
          ) as CursorPageMeta;
          result.page.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PackageLedgerResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackageLedgerResultBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

