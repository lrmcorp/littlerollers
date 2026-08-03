//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'session_adjustment_summary.g.dart';

/// SessionAdjustmentSummary
///
/// Properties:
/// * [total] 
/// * [pending] 
/// * [posted] 
/// * [rejected] 
@BuiltValue()
abstract class SessionAdjustmentSummary implements Built<SessionAdjustmentSummary, SessionAdjustmentSummaryBuilder> {
  @BuiltValueField(wireName: r'total')
  int get total;

  @BuiltValueField(wireName: r'pending')
  int get pending;

  @BuiltValueField(wireName: r'posted')
  int get posted;

  @BuiltValueField(wireName: r'rejected')
  int get rejected;

  SessionAdjustmentSummary._();

  factory SessionAdjustmentSummary([void updates(SessionAdjustmentSummaryBuilder b)]) = _$SessionAdjustmentSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SessionAdjustmentSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SessionAdjustmentSummary> get serializer => _$SessionAdjustmentSummarySerializer();
}

class _$SessionAdjustmentSummarySerializer implements PrimitiveSerializer<SessionAdjustmentSummary> {
  @override
  final Iterable<Type> types = const [SessionAdjustmentSummary, _$SessionAdjustmentSummary];

  @override
  final String wireName = r'SessionAdjustmentSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SessionAdjustmentSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(int),
    );
    yield r'pending';
    yield serializers.serialize(
      object.pending,
      specifiedType: const FullType(int),
    );
    yield r'posted';
    yield serializers.serialize(
      object.posted,
      specifiedType: const FullType(int),
    );
    yield r'rejected';
    yield serializers.serialize(
      object.rejected,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SessionAdjustmentSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SessionAdjustmentSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.total = valueDes;
          break;
        case r'pending':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pending = valueDes;
          break;
        case r'posted':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.posted = valueDes;
          break;
        case r'rejected':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rejected = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SessionAdjustmentSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SessionAdjustmentSummaryBuilder();
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

