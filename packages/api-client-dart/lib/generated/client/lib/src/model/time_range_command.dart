//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'time_range_command.g.dart';

/// TimeRangeCommand
///
/// Properties:
/// * [branchId] 
/// * [startAt] - RFC3339 with numeric offset or Z
/// * [endAt] - RFC3339 exclusive boundary with numeric offset or Z
@BuiltValue()
abstract class TimeRangeCommand implements Built<TimeRangeCommand, TimeRangeCommandBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  /// RFC3339 with numeric offset or Z
  @BuiltValueField(wireName: r'startAt')
  DateTime get startAt;

  /// RFC3339 exclusive boundary with numeric offset or Z
  @BuiltValueField(wireName: r'endAt')
  DateTime get endAt;

  TimeRangeCommand._();

  factory TimeRangeCommand([void updates(TimeRangeCommandBuilder b)]) = _$TimeRangeCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TimeRangeCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TimeRangeCommand> get serializer => _$TimeRangeCommandSerializer();
}

class _$TimeRangeCommandSerializer implements PrimitiveSerializer<TimeRangeCommand> {
  @override
  final Iterable<Type> types = const [TimeRangeCommand, _$TimeRangeCommand];

  @override
  final String wireName = r'TimeRangeCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TimeRangeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'startAt';
    yield serializers.serialize(
      object.startAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'endAt';
    yield serializers.serialize(
      object.endAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TimeRangeCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TimeRangeCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'startAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.startAt = valueDes;
          break;
        case r'endAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.endAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TimeRangeCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TimeRangeCommandBuilder();
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

