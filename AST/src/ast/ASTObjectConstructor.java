package ast;
import java.util.*;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of AST node construction of object constructor declaration
 * in Java and Python programs
 * (C does not support objects)
 *
 */
public class ASTObjectConstructor extends ASTBlockStatement {
	private static final String NODE_TYPE = "Object Statement";
	
	protected ArrayList<ASTExpressionUnitIdentifier> parameters;
	protected ArrayList<ASTStatement> statements;
	public ASTObjectConstructor() {
		super();
		this.parameters = new ArrayList<ASTExpressionUnitIdentifier>();
		this.statements = new ArrayList<ASTStatement>();
	}
	protected void addParameter(ASTExpressionUnitIdentifier p){
		this.parameters.add(p);
		p.addParent(this);
	}
	public void addStatement(ASTStatement s){
		this.statements.add(s);
		s.addParent(this);
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	//virtual methods
	public String toSyntax(){
		return this.result;
	}
	public String toTree(int indent){
		StringBuilder sb = new StringBuilder("");
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for(ASTStatement s:this.statements){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		return sb.toString();
	}
}
